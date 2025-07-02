"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaximailApi = void 0;
class TaximailApi {
    constructor() {
        this.name = 'taximailApi';
        this.displayName = 'Taximail API';
        this.documentationUrl = 'https://taximail.com/docs';
        this.icon = 'file:taximail.svg';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'username',
                type: 'string',
                default: '',
                required: true,
                description: 'Your Taximail API Key from the Integration section',
            },
            {
                displayName: 'Secret Key',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'Your Taximail Secret Key from the Integration section',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                auth: {
                    username: '={{$credentials.username}}',
                    password: '={{$credentials.password}}',
                },
            },
        };
    }
}
exports.TaximailApi = TaximailApi;
//# sourceMappingURL=TaximailApi.credentials.js.map