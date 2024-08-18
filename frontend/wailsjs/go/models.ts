export namespace ipc {
	
	export class Bag {
	    tiles?: number[];
	
	    static createFrom(source: any = {}) {
	        return new Bag(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tiles = source["tiles"];
	    }
	}
	export class GameBoard {
	    num_rows?: number;
	    num_cols?: number;
	    tiles?: number[];
	    is_empty?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GameBoard(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.num_rows = source["num_rows"];
	        this.num_cols = source["num_cols"];
	        this.tiles = source["tiles"];
	        this.is_empty = source["is_empty"];
	    }
	}
	export class Timers {
	    time_of_last_update?: number;
	    time_started?: number;
	    time_remaining?: number[];
	    max_overtime?: number;
	    increment_seconds?: number;
	    reset_to_increment_after_turn?: boolean;
	    untimed?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Timers(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.time_of_last_update = source["time_of_last_update"];
	        this.time_started = source["time_started"];
	        this.time_remaining = source["time_remaining"];
	        this.max_overtime = source["max_overtime"];
	        this.increment_seconds = source["increment_seconds"];
	        this.reset_to_increment_after_turn = source["reset_to_increment_after_turn"];
	        this.untimed = source["untimed"];
	    }
	}
	export class GameMetaEvent {
	    orig_event_id?: string;
	    timestamp?: timestamppb.Timestamp;
	    type?: number;
	    player_id?: string;
	    game_id?: string;
	    expiry?: number;
	
	    static createFrom(source: any = {}) {
	        return new GameMetaEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.orig_event_id = source["orig_event_id"];
	        this.timestamp = this.convertValues(source["timestamp"], timestamppb.Timestamp);
	        this.type = source["type"];
	        this.player_id = source["player_id"];
	        this.game_id = source["game_id"];
	        this.expiry = source["expiry"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class MetaEventData {
	    events?: GameMetaEvent[];
	
	    static createFrom(source: any = {}) {
	        return new MetaEventData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.events = this.convertValues(source["events"], GameMetaEvent);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GameEvent {
	    note?: string;
	    rack?: number[];
	    type?: number;
	    cumulative?: number;
	    row?: number;
	    column?: number;
	    direction?: number;
	    position?: string;
	    played_tiles?: number[];
	    exchanged?: number[];
	    score?: number;
	    bonus?: number;
	    end_rack_points?: number;
	    lost_score?: number;
	    is_bingo?: boolean;
	    words_formed?: number[][];
	    millis_remaining?: number;
	    player_index?: number;
	    words_formed_friendly?: string[];
	
	    static createFrom(source: any = {}) {
	        return new GameEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.note = source["note"];
	        this.rack = source["rack"];
	        this.type = source["type"];
	        this.cumulative = source["cumulative"];
	        this.row = source["row"];
	        this.column = source["column"];
	        this.direction = source["direction"];
	        this.position = source["position"];
	        this.played_tiles = source["played_tiles"];
	        this.exchanged = source["exchanged"];
	        this.score = source["score"];
	        this.bonus = source["bonus"];
	        this.end_rack_points = source["end_rack_points"];
	        this.lost_score = source["lost_score"];
	        this.is_bingo = source["is_bingo"];
	        this.words_formed = source["words_formed"];
	        this.millis_remaining = source["millis_remaining"];
	        this.player_index = source["player_index"];
	        this.words_formed_friendly = source["words_formed_friendly"];
	    }
	}
	export class GameDocument_MinimalPlayerInfo {
	    nickname?: string;
	    real_name?: string;
	    user_id?: string;
	    quit?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GameDocument_MinimalPlayerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nickname = source["nickname"];
	        this.real_name = source["real_name"];
	        this.user_id = source["user_id"];
	        this.quit = source["quit"];
	    }
	}
	export class GameDocument {
	    players?: GameDocument_MinimalPlayerInfo[];
	    events?: GameEvent[];
	    version?: number;
	    lexicon?: string;
	    uid?: string;
	    description?: string;
	    racks?: number[][];
	    challenge_rule?: number;
	    play_state?: number;
	    current_scores?: number[];
	    variant?: string;
	    winner?: number;
	    board_layout?: string;
	    letter_distribution?: string;
	    type?: number;
	    timers_started?: boolean;
	    end_reason?: number;
	    meta_event_data?: MetaEventData;
	    created_at?: timestamppb.Timestamp;
	    board?: GameBoard;
	    bag?: Bag;
	    scoreless_turns?: number;
	    player_on_turn?: number;
	    timers?: Timers;
	
	    static createFrom(source: any = {}) {
	        return new GameDocument(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.players = this.convertValues(source["players"], GameDocument_MinimalPlayerInfo);
	        this.events = this.convertValues(source["events"], GameEvent);
	        this.version = source["version"];
	        this.lexicon = source["lexicon"];
	        this.uid = source["uid"];
	        this.description = source["description"];
	        this.racks = source["racks"];
	        this.challenge_rule = source["challenge_rule"];
	        this.play_state = source["play_state"];
	        this.current_scores = source["current_scores"];
	        this.variant = source["variant"];
	        this.winner = source["winner"];
	        this.board_layout = source["board_layout"];
	        this.letter_distribution = source["letter_distribution"];
	        this.type = source["type"];
	        this.timers_started = source["timers_started"];
	        this.end_reason = source["end_reason"];
	        this.meta_event_data = this.convertValues(source["meta_event_data"], MetaEventData);
	        this.created_at = this.convertValues(source["created_at"], timestamppb.Timestamp);
	        this.board = this.convertValues(source["board"], GameBoard);
	        this.bag = this.convertValues(source["bag"], Bag);
	        this.scoreless_turns = source["scoreless_turns"];
	        this.player_on_turn = source["player_on_turn"];
	        this.timers = this.convertValues(source["timers"], Timers);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

export namespace main {
	
	export class Config {
	
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace timestamppb {
	
	export class Timestamp {
	    seconds?: number;
	    nanos?: number;
	
	    static createFrom(source: any = {}) {
	        return new Timestamp(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.seconds = source["seconds"];
	        this.nanos = source["nanos"];
	    }
	}

}

