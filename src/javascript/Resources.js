import Loader from './Utils/Loader';
import EventEmitter from './Utils/EventEmitter';

import penSource from '../models/role/pen.glb';
import penMinSource from '../models/role/pen.min.glb';
import scene1Source from '../models/scene1/scene1.glb';
import scene1TextureSource from '../models/scene1/scene1.jpg';
import spotSource from '../models/particles/spot.png';

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
            { name: 'penMin', source: penMinSource },
            { name: 'scene1', source: scene1Source },
            { name: 'scene1Texture', source: scene1TextureSource },
            { name: 'spot', source: spotSource },
        ]);
    }
}
