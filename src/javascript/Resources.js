import Loader from './Utils/Loader';
import EventEmitter from './Utils/EventEmitter';

import penSource from '../models/role/pen.glb';

export default class Resources extends EventEmitter {
    constructor() {
        super();

        this.loader = new Loader();
        this.items = {}; // {'name1': texture1, 'name2': texture2, ...}

        // execute after loading each asset
        this.loader.on('fileEnd', (_resource, _data) => {
            this.items[_resource.name] = _data;

            const { loaded, toLoad } = this.loader;
            const percent = Math.round((loaded / toLoad) * 100);
            this.trigger('progess', [percent]);
        });

        // all finished
        this.loader.on('end', () => {
            this.trigger('ready');
        });

        this.loader.load([
            { name: 'pen', source: penSource },
        ]);
    }
}
