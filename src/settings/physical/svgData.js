const Grid = {
    name: 'grid',
    path: ['M0 0 h500M0 20 h500M0 40 h500M0 60 h500M0 80 h500M0 100 h500M0 120 h500M0 140 h500M0 160 h500M0 180 h500M0 200 h500M0 220 h500M0 240 h500M0 260 h500M0 280 h500M0 300 h500M0 320 h500M0 340 h500M0 360 h500M0 380 h500M0 400 h500M0 420 h500M0 440 h500M0 460 h500M0 480 h500M0 0 V500M20 0 V500M40 0 V500M60 0 V500M80 0 V500M100 0 V500M120 0 V500M140 0 V500M160 0 V500M180 0 V500M200 0 V500M220 0 V500M240 0 V500M260 0 V500M280 0 V500M300 0 V500M320 0 V500M340 0 V500M360 0 V500M380 0 V500M400 0 V500M420 0 V500M440 0 V500M460 0 V500M480 0 V500'],
};
const Battery = {
    name: 'E',
    path: ['M0 20 H35', 'M35 0 V40', 'M45 10 V30', 'M45 20 H80'],
};

const Resistance = {
    name: 'R',
    path: ['M0 20H20 ', 'M20 10V30 ', 'M20 10H60', 'M20 30H60', 'M60 10V30', 'M60 20H80'],
};

const Switch = {
    name: 'K',
    path: ['M0 20 H20 ', 'M20 20 L54.6410 0 ', 'M60 20 H80 '],
    shape: {
        circle: [{size:6,x:17,y:17}]
    }
};

const Lamp = {
    name: 'L',
    path: ['M0 20 H20 ', 'M60 20 H80 '],
    shape: {
        circle: [{size:40,x:20,y:0}]
    },
    text: [{text: 'X', x: 30, y: -5, size: 30}]
};

const Voltmeter = {
    name: 'V',
    path: ["M0 20 H20 ","M60 20 H80 "],
    shape: {
        circle: [{size:40,x:20,y:0}]
    },
    text:[{text:'V',x:30,y:-5,size:30}]
}

const Ammeter = {
    name: 'A',
    path: ["M0 20 H20 ","M60 20 H80 "],
    shape: {
        circle: [{size:40,x:20,y:0}]
    },
    text:[{text:'A',x:30,y:-5,size:30}]
}

export {Battery, Grid, Resistance, Switch, Voltmeter, Ammeter, Lamp};
