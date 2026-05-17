


import { Plugin, TFile, Editor, Menu, Notice, normalizePath, Modal, ButtonComponent, App, TAbstractFile, Vault} from 'obsidian';
import { workerCode } from './engine';
import { IlluminatorSettings, Default_Settings, IlluminatorSettingTab } from './settings';
import { t } from './lang';

const SUPPORTED_FORMATS = ["png", "jpg", "jpeg", "webp"];

export default class Illuminator extends Plugin {
    settings!: IlluminatorSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new IlluminatorSettingTab(this.app, this));

        // 1. THE PASTE HANDLER
        this.registerEvent(
            this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor) => {
                if (evt.defaultPrevented) return;
                
                if (!this.settings.enableAutoIllumination) return;

                const files = evt.clipboardData?.files;
                if (!files || files.length === 0) return;

                const imageFiles = Array.from(files).filter(f => {
                    const ext = f.name.split('.').pop()?.toLowerCase() ?? "";
                    return SUPPORTED_FORMATS.includes(ext);
                });

                if (imageFiles.length > 0) {
                    // CRITICAL: Prevent default IMMEDIATELY before any 'await'
                    evt.preventDefault();
                    
                    // Trigger the async processing without blocking the event loop
                    void this.handlePaste(imageFiles, editor).catch(err => {
                        console.error("Illuminator: Failed to process pasted images", err);
                        new Notice(t.ERROR_PROCESS_PASTE);
                    });
                }
            })
        );

        // 2. THE RIGHT-CLICK HANDLER (Shared for single and multiple)     
        const addMenu = (menu: Menu, files: TAbstractFile[]) => {
            // Filter for TFile AND the extension in one go
            const targetFiles = files.filter((f): f is TFile => 
                f instanceof TFile && SUPPORTED_FORMATS.includes(f.extension.toLowerCase())
            );
            
            if (targetFiles.length === 0) return;

            menu.addItem((item) => {
                item
                    .setTitle(t.ILLUMINATE_ACTION)
                    .setIcon("wand-2")
                    .onClick(async () => {
                        if (targetFiles.length > 1) {
                            new ConfirmationModal(this.app, targetFiles.length, async () => {
                                for (const file of targetFiles) {
                                    await this.processFileInPlace(file, true);
                                }
                                this.logBatchReport(targetFiles.length);
                            }).open();
                        } else {
                            // Check if it exists to satisfy the "Undefined" error
                            const singleFile = targetFiles[0];
                            if (singleFile) {
                                await this.processFileInPlace(singleFile, false);
                            }
                        }});
                    });
                };
            
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => addMenu(menu, [file]))
        );
        this.registerEvent(
            this.app.workspace.on("files-menu", (menu, files) => addMenu(menu, files))
        );
    }

    // helper to manage the async loop for pasting
    async handlePaste(files: File[], editor: Editor) {
        for (const file of files) {
            const result = await this.processInWorker(file);
            if (result) {
                await this.saveAndInsert(result.blob, result.ext, editor, file.name, true);
            }
        }
    }

    async processFileInPlace(file: TFile, isBatch: boolean) {
    try {
        // 1. Read the current bytes
        const data = await this.app.vault.readBinary(file);
        const parentPath = file.parent ? file.parent.path : "";

        // 2. Optional: Create backup before processing
        if (this.settings.doBackup) {
            const backupPath = normalizePath(`${parentPath}/${file.basename}_ORIGINAL.${file.extension}`);
            // Only create if it doesn't exist to avoid overwriting backups
            if (!this.app.vault.getAbstractFileByPath(backupPath)) {
                await this.app.vault.createBinary(backupPath, data);
            }
        }

        // 3. Process in Worker (convert to WebP/Adjust)
        const result = await this.processInWorker(new Blob([data]));
        if (!result) return; 

        // 4. Generate the target path
        let finalPath = getUniquePath(parentPath, file.basename, result.ext, this.app.vault);
        const newBinary = await result.blob.arrayBuffer();

        // 5. THE LINK-SAVING SWAP
        if (file.path === finalPath) {
            // Case A: Path is identical (e.g. original was already .webp)
            // Just update the bytes.
            await this.app.vault.modifyBinary(file, newBinary);
        } else {
            // Case B: Path changed (e.g. .png -> .webp)
            
            // STEP 1: Rename the file object. 
            // This triggers Obsidian to find every [[image.png]] and change it to [[image.webp]]
            await this.app.fileManager.renameFile(file, finalPath);
            
            // STEP 2: Now that the file has the new name/extension, update its contents
            // Note: the 'file' object automatically updates its internal path after renameFile
            await this.app.vault.modifyBinary(file, newBinary);
        }

        if (!isBatch) new Notice(`Illuminated: ${file.name}`);

    } catch (err) {
        console.error("Illuminator Error:", err);
        new Notice(`Error processing ${file.name}`);
    }
}

    async processInWorker(file: File | Blob): Promise<{ blob: Blob, ext: string } | null> {
        const bitmap = await createImageBitmap(file);
        const codeString = `(${workerCode.toString()})()`;
        const workerBlob = new Blob([codeString], { type: 'text/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);

        return new Promise((resolve) => {
            worker.onmessage = (e) => {
                worker.terminate();
                URL.revokeObjectURL(workerUrl);
                
                const data = e.data as { error?: string; blob: Blob; ext: string };

                if (e.data.error) {
                    console.error("Illuminator Error:", e.data.error);
                    resolve(null);
                } else {
                    resolve({ blob: e.data.blob, ext: e.data.ext });
                }
            };
            worker.postMessage({
                bitmap,
                threshold: this.settings.threshold,
                doTransparency: this.settings.doTransparency,
                doWebP: this.settings.doWebP
            }, [bitmap]);
        });
    }

async saveAndInsert(blob: Blob, ext: string, editor: Editor, originalName: string, isPaste: boolean = false) {
    try {
        let baseName: string;
        if (isPaste) {
            const moment = (window as any).moment;
            baseName = "IMG_" + moment().format("YYYYMMDDHHmmss");
        } else {
            const lastDotIndex = originalName.lastIndexOf(".");
            baseName = lastDotIndex !== -1 ? originalName.substring(0, lastDotIndex) : originalName;
        }

        const fileName = `${baseName}.${ext}`;
        const activeFile = this.app.workspace.getActiveFile();

        
        // This automatically checks the user's settings and provides the full unique path
        const uniquePath = await this.app.fileManager.getAvailablePathForAttachment(
            fileName, 
            (activeFile ? activeFile.path : "") as string
        );

        const buffer = await blob.arrayBuffer();
        const newFile = await this.app.vault.createBinary(uniquePath, buffer);
        
        // Generate the link correctly based on the new file's location
        let link = this.app.fileManager.generateMarkdownLink(newFile, activeFile ? activeFile.path : "");
        if (!link.startsWith("!")) link = "!" + link;

        editor.replaceSelection(link);

    } catch (err) {
        console.error("Illuminator Save Error:", err);
        new Notice(t.ERROR_SAVE + originalName);
    }
}

    // The Batch Report (The only UI feedback)
    logBatchReport(count: number) {
            new Notice(
            `${t.REPORT_TITLE}\n${count} ${t.PROCESSED}`, 
                5000
            );
    }

        async loadSettings() { this.settings = Object.assign({}, Default_Settings, await this.loadData()); }
        async saveSettings() { await this.saveData(this.settings); }
}


function getUniquePath(basePath: string, baseName: string, ext: string, vault: Vault): string {
    let finalPath = normalizePath(`${basePath}/${baseName}.${ext}`);
    let counter = 1;
    while (vault.getAbstractFileByPath(finalPath)) {
        finalPath = normalizePath(`${basePath}/${baseName}_${counter}.${ext}`);
        counter++;
    }
    return finalPath;
}


class ConfirmationModal extends Modal {
    onSubmit: () => Promise<void>;
    count: number;
    constructor(app: App, count: number, onSubmit: () => Promise<void>) {
        super(app);
        this.count = count;
        this.onSubmit = onSubmit;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: t.ILLUMINATE_COMMAND });
        contentEl.createEl("p", { text: `${this.count} ${t.WARNING}` });
        const btnContainer = contentEl.createDiv({ cls: "modal-button-container" });
        new ButtonComponent(btnContainer)
            .setButtonText(t.CONFIRM).setCta().onClick(async () => {
                this.close();
                await this.onSubmit();
            });
        new ButtonComponent(btnContainer).setButtonText(t.CANCEL).onClick(() => this.close());
    }
}