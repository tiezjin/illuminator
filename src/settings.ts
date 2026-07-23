

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
}


export class IlluminatorSettingTab extends PluginSettingTab {
    plugin: Illuminator;

    constructor(app: App, plugin: Illuminator) {
        super(app, plugin);
        this.plugin = plugin;
    }



    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        new Setting(containerEl)
            .setName(t.ILLUMINATOR_SETTINGS)
            .setHeading();

        // auto-illuminate on paste
        new Setting(containerEl)
            .setName(t.AUTO_ILLUMINATE)
            .setDesc(t.AUTO_ILLUMINATE_DESC)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableAutoIllumination)
                .onChange(async (value) => {
                    this.plugin.settings.enableAutoIllumination = value;
                    await this.plugin.saveSettings();
                    this.display();
                })
            );

        // change file name
        if (this.plugin.settings.enableAutoIllumination) {
            new Setting(containerEl)
                .setName(t.DO_CHANGE_IMG_NAME)
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.doNameChange)
                    .onChange(async (value) => {
                        this.plugin.settings.doNameChange = value;
                        await this.plugin.saveSettings();
                        this.display();
                    })

                );
        }

        // add name pattern field
        if (this.plugin.settings.enableAutoIllumination && this.plugin.settings.doNameChange) {
            new Setting(containerEl)
                .setName(t.IMAGE_NAME_PATTERN)
                .setDesc(t.IMAGE_NAME_PATTERN_DESC)
                .addText(text => {
                    text.setValue(this.plugin.settings.imageNamePattern || '')
                        .onChange(async (value) => {
                            this.plugin.settings.imageNamePattern = value;
                            await this.plugin.saveSettings();
                        });

                    text.inputEl.addClass("illuminator-dim-input")
                });
        }
        // make image transparent
        new Setting(containerEl)
            .setName(t.DO_TRANSPARENCY)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.doTransparency)
                .onChange(async (value) => {
                    this.plugin.settings.doTransparency = value;
                    await this.plugin.saveSettings();
                    this.display(); // Refresh to show/hide the slider below
                })
            );

        if (this.plugin.settings.doTransparency) {
            new Setting(containerEl)
                .setName(t.THRESHOLD)
                .setDesc(t.THRESHOLD_DESC)
                .addSlider(slider => {
                    slider.setLimits(0, 255, 5)
                        .setValue(this.plugin.settings.threshold);

                    // Helper to update the tooltip
                    const updateTooltip = (val: number) => {
                        slider.sliderEl.setAttribute('aria-label', val.toString());
                    };

                    // Initialize
                    updateTooltip(this.plugin.settings.threshold);

                    slider.onChange(async (value) => {
                        updateTooltip(value);
                        this.plugin.settings.threshold = value;
                        await this.plugin.saveSettings();
                    });
                });
        }

        // convert to WebP
        new Setting(containerEl)
            .setName(t.DO_WEBP)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.doWebP)
                .onChange(async (value) => {
                    this.plugin.settings.doWebP = value;
                    await this.plugin.saveSettings();
                })
            );





        //backup choice
        new Setting(containerEl)
            .setName(t.DO_BACKUP)
            .setDesc(t.DO_BACKUP_DESC)
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.doBackup)
                .onChange(async (value) => {
                    this.plugin.settings.doBackup = value;
                    await this.plugin.saveSettings();
                })
            );


    }
}