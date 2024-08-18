import { ipc } from "../../wailsjs/go/models";
import { Alphabet, runesToMachineWord } from "../constants/alphabets";
import { CrosswordGameGridLayout } from "../constants/board_layout";
import { Board } from "../utils/cwgame/board";
import {
  MachineLetter,
  MachineWord,
  PlayedTiles,
  PlayerOfTiles,
} from "../utils/cwgame/common";

type TileDistribution = { [ml: MachineLetter]: number };

export type RawPlayerInfo = {
  userID: string;
  score: number;
  onturn: boolean;
  currentRack: MachineWord;
};

export type PlayerOrder = "p0" | "p1";
export const indexToPlayerOrder = (idx: number): PlayerOrder => {
  if (!(idx >= 0 && idx <= 1)) {
    throw new Error("unexpected player index");
  }
  return `p${idx}` as PlayerOrder;
};

// Same values as the ipc GameDocument
enum PlayState {
  PLAYING = 0,
  WAITING_FOR_FINAL_PASS = 1,
  GAME_OVER = 2,
  UNSTARTED = 3,
}

export type GameState = {
  board: Board;
  // The initial tile distribution:
  alphabet: Alphabet;
  // players are always in order of who went first:
  players: Array<RawPlayerInfo>;
  // The unseen tiles to the user (bag and opp's tiles)
  pool: TileDistribution;
  onturn: number; // index in players
  turns: Array<ipc.GameEvent>;
  gameID: string;
  lastPlayedTiles: PlayedTiles;
  playerOfTileAt: PlayerOfTiles; // not cleaned up after challenges
  nickToPlayerOrder: { [nick: string]: PlayerOrder };
  uidToPlayerOrder: { [uid: string]: PlayerOrder };
  playState: PlayState;
  gameDocument: ipc.GameDocument;
};

const makePool = (alphabet: Alphabet): TileDistribution => {
  const td: TileDistribution = {};
  alphabet.letters.forEach((l, idx) => {
    td[idx] = l.count;
  });
  return td;
};

export const startingGameState = (
  alphabet: Alphabet,
  players: Array<RawPlayerInfo>,
  gameID: string,
  layout = CrosswordGameGridLayout
): GameState => {
  const gs = {
    board: new Board(layout),
    alphabet,
    pool: makePool(alphabet),
    turns: new Array<ipc.GameEvent>(),
    players,
    onturn: 0,
    gameID,
    lastPlayedTiles: {},
    playerOfTileAt: {},
    nickToPlayerOrder: {},
    uidToPlayerOrder: {},
    playState: PlayState.GAME_OVER,
    gameDocument: new ipc.GameDocument(),
  };
  return gs;
};

// const placeOnBoard = (
//   board: Board,
//   pool: TileDistribution,
//   evt: ipc.GameEvent,
//   alphabet: Alphabet
// ): [PlayedTiles, TileDistribution] => {
//   const play = evt.played_tiles;
//   const playedTiles: PlayedTiles = {};
//   const newPool = { ...pool };

//   const mls = runesToMachineWord(play, alphabet);
//   for (let i = 0; i < mls.length; i++) {
//     const ml = mls[i];
//     const row =
//       evt.direction === GameEvent_Direction.VERTICAL ? evt.row + i : evt.row;
//     const col =
//       evt.direction === GameEvent_Direction.HORIZONTAL
//         ? evt.column + i
//         : evt.column;
//     const tile = { row, col, ml };
//     if (ml !== 0 && board.letterAt(row, col) === 0) {
//       board.addTile(tile);
//       if (isDesignatedBlankMachineLetter(tile.ml)) {
//         newPool[0] -= 1;
//       } else {
//         newPool[tile.ml] -= 1;
//       }
//       playedTiles[`R${row}C${col}`] = true;
//     } // Otherwise, we played through a letter.
//   }
//   return [playedTiles, newPool];
// };
