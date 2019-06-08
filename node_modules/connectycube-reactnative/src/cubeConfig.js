let config = {
    version: '1.7.2',
    creds: {
        appId: '',
        authKey: '',
        authSecret: ''
    },
    endpoints: {
        api: 'api.connectycube.com',
        chat: 'chat.connectycube.com',
        muc: 'muc.chat.connectycube.com'
    },
    hash: 'sha1',
    chatProtocol: {
        bosh: 'https://chat.connectycube.com:5281',
        websocket: 'wss://chat.connectycube.com:5291',
        active: 2
    },
    webSession: {
        getSessionTimeInterval: 3,
        getSessionTimeout: 120
    },
    chat: {
        contactList: {
            subscriptionMode: {
                mutual: true
            }
        },
        reconnectionTimeInterval: 5,
        streamManagement: {
            enable: false
        }
    },
    videochat: {
        answerTimeInterval: 60,
        dialingTimeInterval: 5,
        disconnectTimeInterval: 30,
        statsReportTimeInterval: false,
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            },
            {
                urls: 'stun:turn.connectycube.com'
            },
            {
                urls: 'turn:turn.connectycube.com:5349?transport=udp',
                username: 'connectycube',
                credential: '4c29501ca9207b7fb9c4b4b6b04faeb1'
            },
            {
                urls: 'turn:turn.connectycube.com:5349?transport=tcp',
                username: 'connectycube',
                credential: '4c29501ca9207b7fb9c4b4b6b04faeb1'
            }
        ]
    },
    urls: {
        session: 'session',
        webSession: 'session/web',
        login: 'login',
        users: 'users',
        chat: 'chat',
        blobs: 'blobs',
        subscriptions: 'subscriptions',
        events: 'events',
        data: 'data',
        addressbook: 'address_book',
        addressbookRegistered: 'address_book/registered_users',
        type: '.json'
    },
    on: {
        sessionExpired: null
    },
    timeout: null,
    debug: {
        mode: 0
    }
};

config.set = function (options) {
    if (typeof options.endpoints === 'object' && options.endpoints.chat) {
        config.endpoints.muc = 'muc.' + options.endpoints.chat;
        config.chatProtocol.bosh = 'https://' + options.endpoints.chat + ':5281';
        config.chatProtocol.websocket = 'wss://' + options.endpoints.chat + ':5291';
    }

    Object.keys(options).forEach(function (key) {
        if (key !== 'set' && config.hasOwnProperty(key)) {
            if (typeof options[key] !== 'object') {
                config[key] = options[key];
            } else {
                Object.keys(options[key]).forEach(function (nextkey) {
                    if (config[key].hasOwnProperty(nextkey)) {
                        config[key][nextkey] = options[key][nextkey];
                    }
                });
            }
        }
    });
};

module.exports = config;
