import { App, PluginSettingTab, Setting } from 'obsidian';
import Illuminator from './main';
import { t } from './lang';

export interface IlluminatorSettings {
    enableAutoIllumination: boolean;
    doTransparency: boolean;
    doWebP: boolean;
    threshold: number;
    doBackup: boolean;
    doNameChange: boolean;
    imageNamePattern: string;
}

export const Default_Settings: IlluminatorSettings = {
    enableAutoIllumination: true,
    doTransparency: true,
    doWebP: true,
    threshold: 235,
    doBackup: false,
    doNameChange: false,
    imageNamePattern: ''
};

export class IlluminatorSettingTab extends PluginSettingTab {
    plugin: Illuminator;

    constructor(app: App, plugin: Illuminator) {
        super(app, plugin);
        this.plugin = plugin;
    }

    // Modern declarative pattern (runs automatically on Obsidian 1.13.0+)
    getSettingDefinitions() {
        return [
            {
                name: t.ILLUMINATOR_SETTINGS,
                type: 'group' as const
            },
            {
                name: t.AUTO_ILLUMINATE,
                desc: t.AUTO_ILLUMINATE_DESC,
                control: {
                    type: 'toggle' as const,
                    key: 'enableAutoIllumination' as const
                }
            },
            {
                name: t.DO_CHANGE_IMG_NAME,
                control: {
                    type: 'toggle' as const,
                    key: 'doNameChange' as const
                },
                visible: () => this.plugin.settings.enableAutoIllumination
            },
            {
                name: t.IMAGE_NAME_PATTERN,
                desc: t.IMAGE_NAME_PATTERN_DESC,
                control: {
                    type: 'text' as const,
                    key: 'imageNamePattern' as const,
                    inputClass: 'illuminator-dim-input'
                },
                visible: () => this.plugin.settings.enableAutoIllumination && this.plugin.settings.doNameChange
            },
            {
                name: t.DO_TRANSPARENCY,
                control: {
                    type: 'toggle' as const,
                    key: 'doTransparency' as const
                }
            },
            {
                name: t.THRESHOLD,
                desc: t.THRESHOLD_DESC,
                control: {
                    type: 'slider' as const,
                    key: 'threshold' as const,
                    min: 0,
                    max: 255,
                    step: 5
                },
                visible: () => this.plugin.settings.doTransparency
            },
            {
                name: t.DO_WEBP,
                control: {
                    type: 'toggle' as const,
                    key: 'doWebP' as const
                }
            },
            {
                name: t.DO_BACKUP,
                desc: t.DO_BACKUP_DESC,
                control: {
                    type: 'toggle' as const,
                    key: 'doBackup' as const
                }
            }
        ];
    }

    // Fallback imperative pattern (runs on Obsidian 1.12.7 and older versions)
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: t.ILLUMINATOR_SETTINGS });

        new Setting(containerEl)
            .setName(t.AUTO_ILLUMINATE)
            .setDesc(t.AUTO_ILLUMINATE_DESC)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableAutoIllumination)
                .onChange(async (value) => {
                    this.plugin.settings.enableAutoIllumination = value;
                    await this.plugin.saveData(this.plugin.settings);
                    this.display();
                })
            );

        if (this.plugin.settings.enableAutoIllumination) {
            new Setting(containerEl)
                .setName(t.DO_CHANGE_IMG_NAME)
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.doNameChange)
                    .onChange(async (value) => {
                        this.plugin.settings.doNameChange = value;
                        await this.plugin.saveData(this.plugin.settings);
                        this.display();
                    })
                );
        }

        if (this.plugin.settings.enableAutoIllumination && this.plugin.settings.doNameChange) {
            new Setting(containerEl)
                .setName(t.IMAGE_NAME_PATTERN)
                .setDesc(t.IMAGE_NAME_PATTERN_DESC)
                .addText(text => {
                    text.setValue(this.plugin.settings.imageNamePattern)
                        .onChange(async (value) => {
                            this.plugin.settings.imageNamePattern = value;
                            await this.plugin.saveData(this.plugin.settings);
                        });

                    text.inputEl.addClass('illuminator-dim-input');
                });
        }

        new Setting(containerEl)
            .setName(t.DO_TRANSPARENCY)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.doTransparency)
                .onChange(async (value) => {
                    this.plugin.settings.doTransparency = value;
                    await this.plugin.saveData(this.plugin.settings);
                    this.display();
                })
            );

        if (this.plugin.settings.doTransparency) {
            new Setting(containerEl)
                .setName(t.THRESHOLD)
                .setDesc(t.THRESHOLD_DESC)
                .addSlider(slider => slider
                    .setLimits(0, 255, 5)
                    .setValue(this.plugin.settings.threshold)
                    .onChange(async (value) => {
                        this.plugin.settings.threshold = value;
                        await this.plugin.saveData(this.plugin.settings);
                    })
                );
        }

        new Setting(containerEl)
            .setName(t.DO_WEBP)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.doWebP)
                .onChange(async (value) => {
                    this.plugin.settings.doWebP = value;
                    await this.plugin.saveData(this.plugin.settings);
                })
            );

        new Setting(containerEl)
            .setName(t.DO_BACKUP)
            .setDesc(t.DO_BACKUP_DESC)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.doBackup)
                .onChange(async (value) => {
                    this.plugin.settings.doBackup = value;
                    await this.plugin.saveData(this.plugin.settings);
                })
            );
    }
}