

import { App, PluginSettingTab, Setting} from 'obsidian';
import Illuminator from './main';
import { t } from './lang';

export interface IlluminatorSettings {
    enableAutoIllumination: boolean;
    doTransparency: boolean;
    doWebP: boolean;
    threshold: number;
    doBackup: boolean;
    
}

export const Default_Settings: IlluminatorSettings = {
    enableAutoIllumination: true,
    doTransparency: true,
    doWebP: true,
    threshold: 235,
    doBackup: false

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
                })
            );

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
                .addSlider(slider => slider
                    .setLimits(0, 255, 5)
                    .setValue(this.plugin.settings.threshold)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.threshold = value;
                        await this.plugin.saveSettings();
                    })
                );
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