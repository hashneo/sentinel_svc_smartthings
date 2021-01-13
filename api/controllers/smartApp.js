'use strict';

const bent = require('bent');

const logger = require('sentinel-common').logger;

module.exports.webhook = (req, res) => {

    let data = req.swagger.params.data.value;

    if ( data.lifecycle === 'CONFIRMATION'){


        const _notify = bent('GET', 200);

        let url = data.confirmationData.confirmationUrl;

        _notify(url)
            .then((res) => {
                if (res.statusCode === 200) {
                    res.json({"status": "ok"});
                }else{
                    res.status(500).json( {} );
                }
            })
            .catch((err) => {
                res.status(500).json( {} );
                logger.error('Notify error: ' + err);
            });

    }

    logger.trace(JSON.stringify(data));

    global.module.handleHttpCallback(req, res);
   // res.json({"status": "ok"});
};
