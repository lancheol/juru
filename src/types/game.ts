import type { LadderGameSession } from './ladderGame'
import type { RandomMoveSlotPhase } from './randomMoveSlot'
import type { RouletteSession } from './roulette'

export type TileType =
  | 'start'
  | 'drink'
  | 'mission'
  | 'move'
  | 'all'
  | 'safe'
  | 'bridge'
  | 'ladder'
  | 'title'
  | 'roulette'
  | 'island'
  | 'random-move'

export type TileEventVisualKey = TileType | 'bridge-alcohol' | 'bridge-water'

export type IslandStatus = 'none' | 'stranded'

export interface Tile {
  id: number
  name: string
  type: TileType
  description: string
  drinkCount?: number
  moveSteps?: number
}

export type BridgeStatus = 'none' | 'pending' | 'on'

export interface Player {
  id: number
  name: string
  position: number
  color: string
  drinkCount: number
  lapCount: number
  bridgeStatus: BridgeStatus
  bridgeSegment: number | null
  islandStatus: IslandStatus
  islandEscapeTurnsLeft: number
}

export interface GameConfig {
  totalLaps: number
  players: { name: string }[]
}

export interface TokenJump {
  id: number
  playerId: number
  kind: 'board' | 'bridge' | 'bridge-exit'
  from: number
  to: number
  bridgeFrom?: number
  bridgeTo?: number
}

export interface MoveStep {
  from: number
  to: number
}

export interface LandResult {
  player: Player
  messages: string[]
  followUpSteps: MoveStep[]
  lapGain: number
}

export interface GameState {
  totalLaps: number
  players: Player[]
  currentPlayerIndex: number
  dice: number | null
  islandEscapeDice1: number | null
  islandEscapeDice2: number | null
  isRolling: boolean
  isMoving: boolean
  showDiceModal: boolean
  showIslandEscapeModal: boolean
  tokenJump: TokenJump | null
  message: string
  isFinished: boolean
  winnerId: number | null
  showVictoryModal: boolean
  showTileEventModal: boolean
  tileEventTileId: number | null
  tileEventVisualKey: TileEventVisualKey | null
  tileEventPhotoSrc: string | null
  tileEventStartLapCount: number | null
  randomMoveTargetTileId: number | null
  showRandomMoveSlotModal: boolean
  randomMoveSlotPhase: RandomMoveSlotPhase
  titleEventLastImageIndex: number | null
  titleEventImageUsedTurn: number[]
  randomGameEventLastImageIndex: number | null
  randomGameEventImageUsedTurn: number[]
  cupidEventLastImageIndex: number | null
  cupidEventImageUsedTurn: number[]
  bridgeAlcoholEventLastImageIndex: number | null
  bridgeAlcoholEventImageUsedTurn: number[]
  bridgeWaterEventLastImageIndex: number | null
  bridgeWaterEventImageUsedTurn: number[]
  exceptEljundanEventLastImageIndex: number | null
  exceptEljundanEventImageUsedTurn: number[]
  randomTeamDrinkLastTeamIndex: number | null
  randomTeamDrinkPickedTeamName: string | null
  showCaptureModal: boolean
  capturedPlayerNames: string[]
  gameTurnCount: number
  showLadderGameModal: boolean
  ladderGameSession: LadderGameSession | null
  showRouletteModal: boolean
  rouletteSession: RouletteSession | null
}

export interface TileEffect {
  message: string
  extraSteps?: number
  drinkCount?: number
}
