import { App, PluginSettingTab } from 'obsidian';
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

    getSettingDefinitions() {
        return [
            // Heading
            {
                name: t.ILLUMINATOR_SETTINGS,
                type: 'group' as const
            },
            // Auto-illuminate on paste
            {
                name: t.AUTO_ILLUMINATE,
                desc: t.AUTO_ILLUMINATE_DESC,
                control: {
                    type: 'toggle' as const,
                    key: 'enableAutoIllumination' as const
                }
            },
            // Change file name (visible only if auto-illumination is enabled)
            {
                name: t.DO_CHANGE_IMG_NAME,
                control: {
                    type: 'toggle' as const,
                    key: 'doNameChange' as const
                },
                visible: () => this.plugin.settings.enableAutoIllumination
            },
            // Image name pattern field (visible only if both are enabled)
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
            // Make image transparent
            {
                name: t.DO_TRANSPARENCY,
                control: {
                    type: 'toggle' as const,
                    key: 'doTransparency' as const
                }
            },
            // Threshold slider (visible only if transparency is enabled)
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
            // Convert to WebP
            {
                name: t.DO_WEBP,
                control: {
                    type: 'toggle' as const,
                    key: 'doWebP' as const
                }
            },
            // Backup choice
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
}