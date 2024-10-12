/**
 * @name USRegionChanger
 * @version 1.1.0
 * @description Плагин для автоматической смены региона голосового канала на регион из США при подключении.
 * @author ZeLiB
 */

module.exports = class USRegionChanger {
    constructor() {
        this.regions = [
            "us-west",    // Запад США
            "us-east",    // Восток США
            "us-central", // Центральный регион США
            "us-south"    // Южный регион США
        ];

        this.observer = null;
        this.currentUserID = null;
    }

    getName() {
        return "USRegionChanger";
    }

    getDescription() {
        return "Автоматически изменяет регион голосового канала на один из регионов США при подключении к каналу.";
    }

    getVersion() {
        return "1.1.0";
    }

    getAuthor() {
        return "ZeLiB";
    }


    start() {
        this.currentUserID = BdApi.findModuleByProps("getCurrentUser").getCurrentUser().id;

        // Создаем наблюдателя для отслеживания изменений состояния голосовых каналов
        this.observer = new MutationObserver(() => this.handleVoiceStateUpdate());
        const voiceStateModule = BdApi.findModuleByProps("getVoiceStates");

        // Наблюдаем за изменениями в голосовых состояниях
        this.observer.observe(document, { childList: true, subtree: true });

        this.changeVoiceRegion();  // Проверка, если уже в канале при старте
    }

    stop() {

        // Останавливаем наблюдателя
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    // Этот метод срабатывает при любом изменении состояния голосовых каналов
    handleVoiceStateUpdate() {
        const currentChannel = this.getCurrentVoiceChannel();
        if (currentChannel) {
            this.changeVoiceRegion(currentChannel);
        }
    }

    changeVoiceRegion(channelId = null) {
        const currentChannel = channelId || this.getCurrentVoiceChannel();
        if (!currentChannel) {
            return;
        }

        const randomRegion = this.regions[Math.floor(Math.random() * this.regions.length)];
        this.setChannelRegion(currentChannel, randomRegion);
    }

    getCurrentVoiceChannel() {
        const voiceStates = BdApi.findModuleByProps("getVoiceStates").getVoiceStates();
        const currentUserID = this.currentUserID;

        for (let [channelId, users] of Object.entries(voiceStates)) {
            if (users[currentUserID]) {
                return channelId;
            }
        }
        return null;
    }

    setChannelRegion(channelId, region) {
        const api = BdApi.findModuleByProps("patch", "getChannel").getChannel(channelId);
        if (api) {
            api.patch(channelId, { region });
            BdApi.alert(`Регион канала изменён на ${region}`);
        } else {
            BdApi.alert("Ошибка при изменении региона.");
        }
    }
};
