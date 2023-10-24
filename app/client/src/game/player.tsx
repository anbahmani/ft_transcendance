class Player {
    
    constructor() {
        this.x = 0;
        this.y = 0;
        this.login = "";
        this.elogin = "";
        this.eid = 0;
        this.host = false;
        this.up = false;
        this.down = false;
        this.eUp = false;
        this.eDown = false;
        this.color = "#FFF";
        this.room = "";
        this.hit = false;
        this.goal = 0;
        this.egoal = 0;
        this.id = 0;
        this.load = false;
        this.gameid = 0;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.login = "";
        this.elogin = "";
        this.eid = 0;
        this.host = false;
        this.up = false;
        this.down = false;
        this.eUp = false;
        this.eDown = false;
        this.color = "#FFF";
        this.room = "";
        this.hit = false;
        this.goal = 0;
        this.egoal = 0;
        this.id = 0;
        this.load = false;
        this.gameid = 0;
    }

    x: number;
    y: number;
    login: string;
    elogin: string;
    eid: number;
    host: boolean;
    up: boolean;
    down: boolean;
    eUp: boolean;
    eDown: boolean;
    color: string;
    room: string;
    hit: boolean;
    goal: number;
    egoal: number;
    id: number;
    load: boolean;
    gameid: number;

}

export const player = new Player();