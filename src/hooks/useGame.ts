import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { BOARD_SIZE, boardTiles, PRE_FINISH_POSITION } from '../data/board'
import { getTileEventVisualKey } from '../data/tileEventModal'
import {
  buildPlayerPaths,
  applyLadderDrinks,
  createLadderGameSession,
  isLadderGameTile,
  LADDER_GAME_TILE_IDS,
  LADDER_RESULT_LABELS,
} from '../data/ladderGame'
import { createPlayersFromConfig } from '../data/players'
import {
  createRouletteSession,
  isRouletteTile,
} from '../data/roulette'
import {
  isMoveRouletteTile,
  MOVE_ROULETTE_TILE_ID,
  resolveMoveRouletteSteps,
} from '../data/moveRoulette'
import {
  BOMB_CHEF_IMAGES,
  createInitialTitleEventImageUsedTurn,
  isTitleEventTile,
  pickTitleEventImage,
  TITLE_EVENT_TILE_IDS,
} from '../data/titleEvent'
import {
  createInitialRandomGameImageUsedTurn,
  isRandomGameEventTile,
  pickRandomGameImage,
  RANDOM_GAME_IMAGES,
  RANDOM_GAME_TILE_IDS,
} from '../data/randomGameEvent'
import {
  createInitialCupidImageUsedTurn,
  CUPID_IMAGES,
  CUPID_TILE_IDS,
  isCupidEventTile,
  pickCupidImage,
} from '../data/cupidEvent'
import {
  formatRandomTeamDrinkMessage,
  isRandomTeamDrinkTile,
  pickRandomTeamDrinkTeam,
  RANDOM_TEAM_DRINK_TILE_ID,
} from '../data/randomTeamDrinkEvent'
import {
  buildRandomMoveSlotItems,
  getRandomMoveSlotItem,
  isRandomMoveEventTile,
  pickRandomMoveTargetTileId,
  RANDOM_MOVE_SLOT_RESULT_HOLD_MS,
  RANDOM_MOVE_TELEPORT_DELAY_MS,
  RANDOM_MOVE_TILE_ID,
  RANDOM_MOVE_TILE_NAME,
  shortestStepsToTarget,
} from '../data/randomMoveEvent'
import type { RandomMoveSlotItem } from '../types/randomMoveSlot'
import {
  ISLAND_IMAGE,
  ISLAND_TILE_ID,
  isIslandTile,
  markIslandStranded,
  mustUseIslandEscapeDice,
} from '../data/desertIsland'
import {
  BRIDGE_ENTRANCE,
  BRIDGE_EXIT,
  BRIDGE_SEGMENT_COUNT,
  BRIDGE_SEGMENTS,
} from '../data/bridge'
import {
  BOMB_SHOT_DRINK_TILE_ID,
  BOMB_SHOT_DRINK_TILE_NAME,
} from '../data/bombShotDrinkEvent'
import {
  BOTTOM_GLASS_TAX_TILE_ID,
  BOTTOM_GLASS_TAX_TILE_NAME,
} from '../data/bottomGlassTaxEvent'
import {
  createInitialExceptEljundanImageUsedTurn,
  EXCEPT_ELJUNDAN_IMAGES,
  EXCEPT_ELJUNDAN_TILE_ID,
  EXCEPT_ELJUNDAN_TILE_NAME,
  isExceptEljundanEventTile,
  pickExceptEljundanImage,
} from '../data/exceptEljundanEvent'
import {
  FINANCE_DEPT_DRINK_TILE_ID,
  FINANCE_DEPT_DRINK_TILE_NAME,
} from '../data/financeDeptDrinkEvent'
import {
  PRESIDENT_TEAM_TILE_ID,
  PRESIDENT_TEAM_TILE_NAME,
} from '../data/presidentTeamEvent'
import {
  BRIDGE_ALCOHOL_IMAGES,
  createInitialBridgeAlcoholImageUsedTurn,
  pickBridgeAlcoholImage,
} from '../data/bridgeAlcoholEvent'
import {
  BRIDGE_WATER_IMAGES,
  createInitialBridgeWaterImageUsedTurn,
  pickBridgeWaterImage,
} from '../data/bridgeWaterEvent'
import {
  findBoardCaptureVictims,
  resetPlayerToStart,
} from '../data/tokenCapture'
import {
  formatTokenCaptureModalMessage,
} from '../data/tokenCaptureEvent'
import {
  START_LAP_IMAGE,
  START_TILE_ID,
} from '../data/startLapEvent'
import type { GameConfig, GameState, LandResult, MoveStep, Player, TileEffect, TileEventVisualKey } from '../types/game'
import type { PlayerItemId } from '../types/playerItem'
import type { RouletteSegment } from '../types/roulette'
import {
  FORBIDDEN_WORD_REVEAL_SECONDS,
  FORBIDDEN_WORD_VIEW_DRINK_COUNT,
  isForbiddenWordRouletteSegment,
} from '../data/forbiddenWord'
import {
  grantPlayerItem,
  consumePlayerItemAt,
  isDrinkExemptionRouletteSegment,
} from '../data/playerItems'

const DICE_ROLL_MS = 1800
const DICE_RESULT_HOLD_MS = 1500
const JUMP_DURATION_MS = 360

let jumpIdCounter = 0

interface PendingTurnFinish {
  playerIndex: number
  player: Player
  dice: number
  lapGain: number
  messages: string[]
  dicePrefix: string
}

interface PendingAfterCapture {
  stage: 'before-land-on-tile' | 'during-follow-up'
  playerIndex: number
  player: Player
  dice: number
  lapGainAccum: number
  messages: string[]
  dicePrefix: string
  totalLaps: number
  playerCount: number
  landingPosition: number
  landOnTileOptions?: { skipBridge?: boolean }
  landResult?: LandResult
  followUpFromIndex?: number
}

interface BoardLandingContext {
  setState: Dispatch<SetStateAction<GameState>>
  stateRef: { current: GameState }
  pendingAfterCaptureRef: { current: PendingAfterCapture | null }
  pendingTurnFinishRef: { current: PendingTurnFinish | null }
  playerIndex: number
  player: Player
  dice: number
  lapGainAccum: number
  messages: string[]
  dicePrefix: string
  totalLaps: number
  playerCount: number
  landingPosition: number
  landOnTileOptions?: { skipBridge?: boolean }
}

// DEV_TEST helpers — Board.tsx 테스트 버튼과 함께 제거
function isDevTestBlocked(state: GameState): boolean {
  return (
    state.isFinished ||
    state.isMoving ||
    state.isRolling ||
    state.showDiceModal ||
    state.showLadderGameModal ||
    state.showTileEventModal ||
    state.showRandomMoveSlotModal ||
    state.showRouletteModal ||
    state.showIslandEscapeModal ||
    state.showCaptureModal ||
    state.showForbiddenWordInputModal ||
    state.showForbiddenWordWarningModal ||
    state.showForbiddenWordRevealModal ||
    state.showPlayerItemUseConfirmModal
  )
}

interface TileEventTestExtras {
  tileEventPhotoSrc?: string | null
  tileEventStartLapCount?: number | null
  randomMoveTargetTileId?: number | null
  titleEventLastImageIndex?: number | null
  titleEventImageUsedTurn?: number[]
  randomGameEventLastImageIndex?: number | null
  randomGameEventImageUsedTurn?: number[]
  cupidEventLastImageIndex?: number | null
  cupidEventImageUsedTurn?: number[]
  exceptEljundanEventLastImageIndex?: number | null
  exceptEljundanEventImageUsedTurn?: number[]
  randomTeamDrinkLastTeamIndex?: number | null
  randomTeamDrinkPickedTeamName?: string | null
}

function buildTileEventModalTestUpdate(
  prev: GameState,
  tileId: number,
  label: string,
  dicePrefix: string,
  extras: TileEventTestExtras = {},
): { state: GameState; pending: PendingTurnFinish } | null {
  if (isDevTestBlocked(prev)) return null

  const idx = prev.currentPlayerIndex
  const tile = boardTiles[tileId]
  const players = [...prev.players]
  players[idx] = {
    ...players[idx],
    position: tileId,
    bridgeStatus: 'none',
    bridgeSegment: null,
    ...(isIslandTile(tileId)
      ? {}
      : { islandStatus: 'none' as const, islandEscapeTurnsLeft: 0 }),
  }

  if (isIslandTile(tileId)) {
    players[idx] = markIslandStranded(players[idx])
  }

  const pending: PendingTurnFinish = {
    playerIndex: idx,
    player: players[idx],
    dice: 0,
    lapGain: 0,
    messages: [`[테스트] ${players[idx].name} → ${tileId}번 ${label}`],
    dicePrefix,
  }

  const state: GameState = {
    ...prev,
    players,
    dice: null,
    tokenJump: null,
    showTileEventModal: true,
    tileEventTileId: tileId,
    tileEventVisualKey: getTileEventVisualKey(tile),
    tileEventPhotoSrc: extras.tileEventPhotoSrc ?? null,
    tileEventStartLapCount: extras.tileEventStartLapCount ?? null,
    randomMoveTargetTileId: extras.randomMoveTargetTileId ?? null,
    message: `[테스트] ${players[idx].name} → ${tileId}번 ${label}`,
    ...(extras.titleEventLastImageIndex !== undefined
      ? { titleEventLastImageIndex: extras.titleEventLastImageIndex }
      : {}),
    ...(extras.titleEventImageUsedTurn !== undefined
      ? { titleEventImageUsedTurn: extras.titleEventImageUsedTurn }
      : {}),
    ...(extras.randomGameEventLastImageIndex !== undefined
      ? { randomGameEventLastImageIndex: extras.randomGameEventLastImageIndex }
      : {}),
    ...(extras.randomGameEventImageUsedTurn !== undefined
      ? { randomGameEventImageUsedTurn: extras.randomGameEventImageUsedTurn }
      : {}),
    ...(extras.cupidEventLastImageIndex !== undefined
      ? { cupidEventLastImageIndex: extras.cupidEventLastImageIndex }
      : {}),
    ...(extras.cupidEventImageUsedTurn !== undefined
      ? { cupidEventImageUsedTurn: extras.cupidEventImageUsedTurn }
      : {}),
    ...(extras.exceptEljundanEventLastImageIndex !== undefined
      ? { exceptEljundanEventLastImageIndex: extras.exceptEljundanEventLastImageIndex }
      : {}),
    ...(extras.exceptEljundanEventImageUsedTurn !== undefined
      ? { exceptEljundanEventImageUsedTurn: extras.exceptEljundanEventImageUsedTurn }
      : {}),
    ...(extras.randomTeamDrinkLastTeamIndex !== undefined
      ? { randomTeamDrinkLastTeamIndex: extras.randomTeamDrinkLastTeamIndex }
      : {}),
    ...(extras.randomTeamDrinkPickedTeamName !== undefined
      ? { randomTeamDrinkPickedTeamName: extras.randomTeamDrinkPickedTeamName }
      : {}),
  }

  return { state, pending }
}

function buildBridgeSegmentModalTestUpdate(
  prev: GameState,
  segmentIndex: number,
): { state: GameState; pending: PendingTurnFinish } | null {
  if (isDevTestBlocked(prev)) return null

  const segment = BRIDGE_SEGMENTS[segmentIndex]
  if (!segment) return null

  const visualKey: TileEventVisualKey =
    segment.type === 'water' ? 'bridge-water' : 'bridge-alcohol'

  const idx = prev.currentPlayerIndex
  const players = [...prev.players]
  players[idx] = {
    ...players[idx],
    position: BRIDGE_ENTRANCE,
    bridgeStatus: 'on',
    bridgeSegment: segmentIndex,
  }

  let tileEventPhotoSrc: string | null = null
  let bridgeAlcoholEventLastImageIndex = prev.bridgeAlcoholEventLastImageIndex
  let bridgeAlcoholEventImageUsedTurn = prev.bridgeAlcoholEventImageUsedTurn
  let bridgeWaterEventLastImageIndex = prev.bridgeWaterEventLastImageIndex
  let bridgeWaterEventImageUsedTurn = prev.bridgeWaterEventImageUsedTurn

  const alcoholUsedTurn =
    prev.bridgeAlcoholEventImageUsedTurn ?? createInitialBridgeAlcoholImageUsedTurn()
  const waterUsedTurn =
    prev.bridgeWaterEventImageUsedTurn ?? createInitialBridgeWaterImageUsedTurn()

  if (visualKey === 'bridge-alcohol') {
    const picked = pickBridgeAlcoholImage(
      prev.gameTurnCount,
      prev.bridgeAlcoholEventLastImageIndex,
      alcoholUsedTurn,
    )
    tileEventPhotoSrc = BRIDGE_ALCOHOL_IMAGES[picked] ?? null
    bridgeAlcoholEventLastImageIndex = picked
    bridgeAlcoholEventImageUsedTurn = [...alcoholUsedTurn]
    bridgeAlcoholEventImageUsedTurn[picked] = prev.gameTurnCount
  } else {
    const picked = pickBridgeWaterImage(
      prev.gameTurnCount,
      prev.bridgeWaterEventLastImageIndex,
      waterUsedTurn,
    )
    tileEventPhotoSrc = BRIDGE_WATER_IMAGES[picked] ?? null
    bridgeWaterEventLastImageIndex = picked
    bridgeWaterEventImageUsedTurn = [...waterUsedTurn]
    bridgeWaterEventImageUsedTurn[picked] = prev.gameTurnCount
  }

  const label = `주당의 길 ${segment.label}`
  const pending: PendingTurnFinish = {
    playerIndex: idx,
    player: players[idx],
    dice: 0,
    lapGain: 0,
    messages: [`[테스트] ${players[idx].name} → ${label}`],
    dicePrefix: segment.type === 'water' ? '💧' : '🍶',
  }

  const state: GameState = {
    ...prev,
    players,
    dice: null,
    tokenJump: null,
    showTileEventModal: true,
    tileEventTileId: BRIDGE_ENTRANCE,
    tileEventVisualKey: visualKey,
    tileEventPhotoSrc,
    message: `[테스트] ${players[idx].name} → ${label}`,
    bridgeAlcoholEventLastImageIndex,
    bridgeAlcoholEventImageUsedTurn,
    bridgeWaterEventLastImageIndex,
    bridgeWaterEventImageUsedTurn,
  }

  return { state, pending }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

function rollBridgeDice(): number {
  return Math.floor(Math.random() * 3) + 1
}

function forwardLapGain(from: number, steps: number): number {
  if (steps <= 0) return 0
  return Math.floor((from + steps) / BOARD_SIZE)
}

function stepsToFinishLine(position: number): number {
  if (position === 0) return BOARD_SIZE
  return BOARD_SIZE - position
}

function capForwardSteps(
  position: number,
  steps: number,
  lapCount: number,
  totalLaps: number,
): number {
  if (steps <= 0 || lapCount !== totalLaps - 1) return steps
  return Math.min(steps, stepsToFinishLine(position))
}

function createInitialState(config: GameConfig): GameState {
  const players = createPlayersFromConfig(config)
  return {
    totalLaps: config.totalLaps,
    players,
    currentPlayerIndex: 0,
    dice: null,
    islandEscapeDice1: null,
    islandEscapeDice2: null,
    isRolling: false,
    isMoving: false,
    showDiceModal: false,
    showIslandEscapeModal: false,
    tokenJump: null,
    message: `${players[0]?.name ?? '플레이어'}부터 시작! 주사위를 굴려 보세요 🍻`,
    isFinished: false,
    winnerId: null,
    showVictoryModal: false,
    showTileEventModal: false,
    tileEventTileId: null,
    tileEventVisualKey: null,
    tileEventPhotoSrc: null,
    tileEventStartLapCount: null,
    randomMoveTargetTileId: null,
    showRandomMoveSlotModal: false,
    randomMoveSlotPhase: 'idle',
    titleEventLastImageIndex: null,
    titleEventImageUsedTurn: createInitialTitleEventImageUsedTurn(),
    randomGameEventLastImageIndex: null,
    randomGameEventImageUsedTurn: createInitialRandomGameImageUsedTurn(),
    cupidEventLastImageIndex: null,
    cupidEventImageUsedTurn: createInitialCupidImageUsedTurn(),
    bridgeAlcoholEventLastImageIndex: null,
    bridgeAlcoholEventImageUsedTurn: createInitialBridgeAlcoholImageUsedTurn(),
    bridgeWaterEventLastImageIndex: null,
    bridgeWaterEventImageUsedTurn: createInitialBridgeWaterImageUsedTurn(),
    exceptEljundanEventLastImageIndex: null,
    exceptEljundanEventImageUsedTurn: createInitialExceptEljundanImageUsedTurn(),
    randomTeamDrinkLastTeamIndex: null,
    randomTeamDrinkPickedTeamName: null,
    showCaptureModal: false,
    capturedPlayerNames: [],
    gameTurnCount: 0,
    showLadderGameModal: false,
    ladderGameSession: null,
    showRouletteModal: false,
    rouletteSession: null,
    forbiddenWords: [],
    showForbiddenWordInputModal: false,
    forbiddenWordInputPlayerName: null,
    showForbiddenWordWarningModal: false,
    showForbiddenWordRevealModal: false,
    forbiddenWordRevealSecondsLeft: 0,
    showPlayerItemUseConfirmModal: false,
    pendingPlayerItemUse: null,
  }
}

function getTileEffect(tileIndex: number): TileEffect {
  const tile = boardTiles[tileIndex]

  switch (tile.type) {
    case 'start':
    case 'bridge':
      return { message: tile.description }
    case 'drink':
      return {
        message: tile.description,
        drinkCount: tile.drinkCount ?? 1,
      }
    case 'mission':
      return { message: tile.description }
    case 'move':
      return {
        message: tile.description,
        extraSteps: tile.moveSteps,
      }
    case 'all':
      return { message: `🍻 ${tile.description}` }
    case 'safe':
      return { message: `✨ ${tile.description}` }
    case 'ladder':
      return { message: tile.description }
    case 'title':
      return { message: tile.description || tile.name }
    case 'roulette':
      return { message: tile.description }
    case 'island':
      return { message: tile.description || tile.name }
    case 'random-move':
      return { message: tile.description || tile.name }
    default:
      return { message: tile.description }
  }
}

function resolvePosition(start: number, steps: number): number {
  return ((start + steps) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE
}

function buildPath(from: number, steps: number): number[] {
  if (steps === 0) return []

  const path: number[] = []
  const direction = steps > 0 ? 1 : -1
  let pos = from

  for (let i = 0; i < Math.abs(steps); i++) {
    pos = resolvePosition(pos, direction)
    path.push(pos)
  }

  return path
}

function applyBridgeSegmentEffect(player: Player, segmentIndex: number): Player {
  const next = { ...player }
  const segment = BRIDGE_SEGMENTS[segmentIndex]

  if (segment.type === 'alcohol') {
    next.drinkCount += 1
  }

  return next
}

function bridgeSegmentMessage(segmentIndex: number): string {
  const segment = BRIDGE_SEGMENTS[segmentIndex]
  return `[주당의 길 ${segmentIndex + 1}] ${segment.label} — ${segment.description}`
}

function resolveBridgeMove(from: number, steps: number): { path: number[]; exits: boolean } {
  const path: number[] = []
  let pos = from

  for (let i = 0; i < steps; i++) {
    const next = pos + 1
    if (next >= BRIDGE_SEGMENT_COUNT) {
      return { path, exits: true }
    }
    path.push(next)
    pos = next
  }

  return { path, exits: false }
}

/** 31번(id) 입구에서 다리 주사위만큼 앞으로 이동 */
function resolveBridgeMoveFromEntrance(steps: number): { path: number[]; exits: boolean } {
  const path: number[] = []

  for (let i = 0; i < steps; i++) {
    if (i >= BRIDGE_SEGMENT_COUNT) {
      return { path, exits: true }
    }
    path.push(i)
  }

  return { path, exits: false }
}

function markBridgePending(player: Player): Player {
  return {
    ...player,
    position: BRIDGE_ENTRANCE,
    bridgeStatus: 'pending',
    bridgeSegment: null,
    islandStatus: 'none',
    islandEscapeTurnsLeft: 0,
  }
}

function landOnTile(
  player: Player,
  tileIndex: number,
  totalLaps: number,
  options?: { skipBridge?: boolean; prependMessages?: string[] },
): LandResult {
  if (tileIndex === ISLAND_TILE_ID) {
    return {
      player: markIslandStranded({ ...player, position: tileIndex }),
      messages: [`[${ISLAND_TILE_ID}] ${boardTiles[ISLAND_TILE_ID]?.name ?? '무인도'} 도착!`],
      followUpSteps: [],
      lapGain: 0,
    }
  }

  if (!options?.skipBridge && tileIndex === BRIDGE_ENTRANCE) {
    return {
      player: markBridgePending(player),
      messages: [`[${BRIDGE_ENTRANCE}] 주당의 길 입구! 다음 턴에 주당의 길로 입장합니다 🍻`],
      followUpSteps: [],
      lapGain: 0,
    }
  }

  const next = { ...player }
  const messages: string[] = [...(options?.prependMessages ?? [])]
  const followUpSteps: MoveStep[] = []
  let lapGain = 0
  let position = tileIndex
  let effect = getTileEffect(position)
  let guard = 0

  while (guard < 5) {
    messages.push(`[${position}] ${effect.message}`)

    if (effect.drinkCount) {
      next.drinkCount += effect.drinkCount
    }

    if (!effect.extraSteps) break

    const extraSteps = capForwardSteps(
      position,
      effect.extraSteps,
      next.lapCount,
      totalLaps,
    )

    if (extraSteps > 0) {
      lapGain += forwardLapGain(position, extraSteps)
    }

    const newPosition = resolvePosition(position, extraSteps)
    followUpSteps.push({ from: position, to: newPosition })
    position = newPosition

    if (!options?.skipBridge && position === BRIDGE_ENTRANCE) {
      return {
        player: markBridgePending({ ...next, position }),
        messages: [...messages, `[${BRIDGE_ENTRANCE}] 주당의 길 입구! 다음 턴에 주당의 길로 입장합니다 🍻`],
        followUpSteps,
        lapGain,
      }
    }

    effect = getTileEffect(position)
    guard++
  }

  next.position = position
  return {
    player: next,
    messages,
    followUpSteps,
    lapGain,
  }
}

async function animateBoardStep(
  setState: Dispatch<SetStateAction<GameState>>,
  playerIndex: number,
  playerId: number,
  from: number,
  to: number,
) {
  if (from === to) return

  const jumpId = ++jumpIdCounter

  setState((prev) => ({
    ...prev,
    tokenJump: { id: jumpId, playerId, kind: 'board', from, to },
  }))
  await sleep(JUMP_DURATION_MS)
  setState((prev) => {
    const players = [...prev.players]
    players[playerIndex] = { ...players[playerIndex], position: to }
    return { ...prev, players, tokenJump: null }
  })
}

async function animateBridgeExit(
  setState: Dispatch<SetStateAction<GameState>>,
  playerIndex: number,
  playerId: number,
  bridgeFrom: number,
  boardTo: number,
) {
  const jumpId = ++jumpIdCounter

  setState((prev) => ({
    ...prev,
    tokenJump: {
      id: jumpId,
      playerId,
      kind: 'bridge-exit',
      from: boardTo,
      to: boardTo,
      bridgeFrom,
    },
  }))
  await sleep(JUMP_DURATION_MS)
  setState((prev) => {
    const players = [...prev.players]
    players[playerIndex] = {
      ...players[playerIndex],
      bridgeStatus: 'none',
      bridgeSegment: null,
      position: boardTo,
    }
    return { ...prev, players, tokenJump: null }
  })
}

async function animateBridgeStep(
  setState: Dispatch<SetStateAction<GameState>>,
  playerIndex: number,
  playerId: number,
  bridgeFrom: number,
  bridgeTo: number,
) {
  if (bridgeFrom === bridgeTo) return

  const jumpId = ++jumpIdCounter

  setState((prev) => ({
    ...prev,
    tokenJump: {
      id: jumpId,
      playerId,
      kind: 'bridge',
      from: BRIDGE_ENTRANCE,
      to: BRIDGE_ENTRANCE,
      bridgeFrom,
      bridgeTo,
    },
  }))
  await sleep(JUMP_DURATION_MS)
  setState((prev) => {
    const players = [...prev.players]
    players[playerIndex] = {
      ...players[playerIndex],
      bridgeStatus: 'on',
      bridgeSegment: bridgeTo,
    }
    return { ...prev, players, tokenJump: null }
  })
}

async function animateBoardPath(
  setState: Dispatch<SetStateAction<GameState>>,
  playerIndex: number,
  playerId: number,
  path: number[],
  startFrom: number,
) {
  let from = startFrom
  for (const to of path) {
    await animateBoardStep(setState, playerIndex, playerId, from, to)
    from = to
  }
}

function finishTurn(
  setState: Dispatch<SetStateAction<GameState>>,
  playerIndex: number,
  player: Player,
  dice: number,
  lapGain: number,
  messages: string[],
  dicePrefix: string,
) {
  setState((prev) => {
    const players = [...prev.players]
    const basePlayer = prev.players[playerIndex] ?? player
    let nextPlayer = {
      ...basePlayer,
      ...player,
      lapCount: player.lapCount + lapGain,
    }

    if (mustUseIslandEscapeDice(nextPlayer)) {
      nextPlayer = markIslandStranded(nextPlayer)
    }

    players[playerIndex] = nextPlayer

    const fullMessage = `${dicePrefix} ${dice}! ${messages.join(' → ')}`
    const hasWon = nextPlayer.lapCount >= prev.totalLaps

    if (hasWon) {
      return {
        ...prev,
        players,
        isMoving: false,
        tokenJump: null,
        isFinished: true,
        winnerId: nextPlayer.id,
        showVictoryModal: true,
        showTileEventModal: false,
        tileEventTileId: null,
        tileEventVisualKey: null,
        tileEventPhotoSrc: null,
        tileEventStartLapCount: null,
        randomMoveTargetTileId: null,
        randomTeamDrinkPickedTeamName: null,
        showRandomMoveSlotModal: false,
        randomMoveSlotPhase: 'idle',
        showLadderGameModal: false,
        ladderGameSession: null,
        showRouletteModal: false,
        rouletteSession: null,
        gameTurnCount: prev.gameTurnCount + 1,
        message: `🏆 ${nextPlayer.name}님이 ${prev.totalLaps}바퀴를 완주해 승리했습니다!`,
      }
    }

    const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length
    const nextUpPlayer = players[nextIndex]

    return {
      ...prev,
      players,
      isMoving: false,
      tokenJump: null,
      currentPlayerIndex: nextIndex,
      message: fullMessage,
      showTileEventModal: false,
      tileEventTileId: null,
      tileEventVisualKey: null,
      tileEventPhotoSrc: null,
      tileEventStartLapCount: null,
      randomMoveTargetTileId: null,
      showRandomMoveSlotModal: false,
      randomMoveSlotPhase: 'idle',
      showLadderGameModal: false,
      ladderGameSession: null,
      showRouletteModal: false,
      rouletteSession: null,
      showIslandEscapeModal: mustUseIslandEscapeDice(nextUpPlayer),
      islandEscapeDice1: null,
      islandEscapeDice2: null,
      gameTurnCount: prev.gameTurnCount + 1,
    }
  })
}

function openRouletteGame(
  setState: Dispatch<SetStateAction<GameState>>,
  pending: PendingTurnFinish,
  playerAfterLand: Player,
  tileId: number,
  message: string,
) {
  const session = createRouletteSession(tileId)

  setState((prev) => {
    const players = [...prev.players]
    players[pending.playerIndex] = { ...playerAfterLand }
    return {
      ...prev,
      players,
      isMoving: false,
      tokenJump: null,
      message,
      showRouletteModal: true,
      rouletteSession: session,
      showTileEventModal: false,
      tileEventTileId: null,
      tileEventVisualKey: null,
      tileEventPhotoSrc: null,
      tileEventStartLapCount: null,
      randomMoveTargetTileId: null,
      showRandomMoveSlotModal: false,
      randomMoveSlotPhase: 'idle',
      showLadderGameModal: false,
      ladderGameSession: null,
    }
  })
}

function openRandomMoveSlot(
  setState: Dispatch<SetStateAction<GameState>>,
  pending: PendingTurnFinish,
  playerAfterLand: Player,
  message: string,
) {
  setState((prev) => {
    const players = [...prev.players]
    players[pending.playerIndex] = { ...playerAfterLand }
    return {
      ...prev,
      players,
      isMoving: false,
      tokenJump: null,
      message,
      showRandomMoveSlotModal: true,
      randomMoveSlotPhase: 'idle',
      randomMoveTargetTileId: null,
      showTileEventModal: false,
      tileEventTileId: null,
      tileEventVisualKey: null,
      tileEventPhotoSrc: null,
      showLadderGameModal: false,
      ladderGameSession: null,
      showRouletteModal: false,
      rouletteSession: null,
    }
  })
}

function openTileEventModal(
  setState: Dispatch<SetStateAction<GameState>>,
  pending: PendingTurnFinish,
  playerAfterLand: Player,
  tileId: number,
  visualKey: TileEventVisualKey,
  message: string,
) {
  setState((prev) => {
    const players = [...prev.players]
    const landedPlayer = isIslandTile(tileId)
      ? markIslandStranded({ ...playerAfterLand })
      : { ...playerAfterLand }
    players[pending.playerIndex] = landedPlayer

    let tileEventPhotoSrc: string | null = null
    let titleEventLastImageIndex = prev.titleEventLastImageIndex
    let titleEventImageUsedTurn = prev.titleEventImageUsedTurn
    let randomGameEventLastImageIndex = prev.randomGameEventLastImageIndex
    let randomGameEventImageUsedTurn = prev.randomGameEventImageUsedTurn
    let cupidEventLastImageIndex = prev.cupidEventLastImageIndex
    let cupidEventImageUsedTurn = prev.cupidEventImageUsedTurn
    let bridgeAlcoholEventLastImageIndex = prev.bridgeAlcoholEventLastImageIndex
    let bridgeAlcoholEventImageUsedTurn = prev.bridgeAlcoholEventImageUsedTurn
    let bridgeWaterEventLastImageIndex = prev.bridgeWaterEventLastImageIndex
    let bridgeWaterEventImageUsedTurn = prev.bridgeWaterEventImageUsedTurn
    let exceptEljundanEventLastImageIndex = prev.exceptEljundanEventLastImageIndex
    let exceptEljundanEventImageUsedTurn = prev.exceptEljundanEventImageUsedTurn
    let randomTeamDrinkLastTeamIndex = prev.randomTeamDrinkLastTeamIndex
    let randomTeamDrinkPickedTeamName = prev.randomTeamDrinkPickedTeamName
    let tileEventStartLapCount: number | null = null

    const alcoholUsedTurn =
      prev.bridgeAlcoholEventImageUsedTurn ?? createInitialBridgeAlcoholImageUsedTurn()
    const waterUsedTurn =
      prev.bridgeWaterEventImageUsedTurn ?? createInitialBridgeWaterImageUsedTurn()

    if (visualKey === 'bridge-alcohol') {
      const picked = pickBridgeAlcoholImage(
        prev.gameTurnCount,
        prev.bridgeAlcoholEventLastImageIndex,
        alcoholUsedTurn,
      )
      tileEventPhotoSrc = BRIDGE_ALCOHOL_IMAGES[picked] ?? null
      bridgeAlcoholEventLastImageIndex = picked
      bridgeAlcoholEventImageUsedTurn = [...alcoholUsedTurn]
      bridgeAlcoholEventImageUsedTurn[picked] = prev.gameTurnCount
    } else if (visualKey === 'bridge-water') {
      const picked = pickBridgeWaterImage(
        prev.gameTurnCount,
        prev.bridgeWaterEventLastImageIndex,
        waterUsedTurn,
      )
      tileEventPhotoSrc = BRIDGE_WATER_IMAGES[picked] ?? null
      bridgeWaterEventLastImageIndex = picked
      bridgeWaterEventImageUsedTurn = [...waterUsedTurn]
      bridgeWaterEventImageUsedTurn[picked] = prev.gameTurnCount
    } else if (isTitleEventTile(tileId)) {
      const picked = pickTitleEventImage(
        prev.gameTurnCount,
        prev.titleEventLastImageIndex,
        prev.titleEventImageUsedTurn,
      )
      tileEventPhotoSrc = BOMB_CHEF_IMAGES[picked]
      titleEventLastImageIndex = picked
      titleEventImageUsedTurn = [...prev.titleEventImageUsedTurn]
      titleEventImageUsedTurn[picked] = prev.gameTurnCount
    } else if (isRandomGameEventTile(tileId)) {
      const picked = pickRandomGameImage(
        prev.gameTurnCount,
        prev.randomGameEventLastImageIndex,
        prev.randomGameEventImageUsedTurn,
      )
      tileEventPhotoSrc = RANDOM_GAME_IMAGES[picked]
      randomGameEventLastImageIndex = picked
      randomGameEventImageUsedTurn = [...prev.randomGameEventImageUsedTurn]
      randomGameEventImageUsedTurn[picked] = prev.gameTurnCount
    } else if (isCupidEventTile(tileId)) {
      const picked = pickCupidImage(
        prev.gameTurnCount,
        prev.cupidEventLastImageIndex,
        prev.cupidEventImageUsedTurn,
      )
      tileEventPhotoSrc = CUPID_IMAGES[picked]
      cupidEventLastImageIndex = picked
      cupidEventImageUsedTurn = [...prev.cupidEventImageUsedTurn]
      cupidEventImageUsedTurn[picked] = prev.gameTurnCount
    } else if (isExceptEljundanEventTile(tileId)) {
      const usedTurn =
        prev.exceptEljundanEventImageUsedTurn ?? createInitialExceptEljundanImageUsedTurn()
      const picked = pickExceptEljundanImage(
        prev.gameTurnCount,
        prev.exceptEljundanEventLastImageIndex,
        usedTurn,
      )
      tileEventPhotoSrc = EXCEPT_ELJUNDAN_IMAGES[picked] ?? null
      exceptEljundanEventLastImageIndex = picked
      exceptEljundanEventImageUsedTurn = [...usedTurn]
      exceptEljundanEventImageUsedTurn[picked] = prev.gameTurnCount
    } else if (isRandomTeamDrinkTile(tileId)) {
      const playerNames = players.map((player) => player.name)
      const pickedTeam = pickRandomTeamDrinkTeam(
        playerNames,
        prev.randomTeamDrinkLastTeamIndex,
      )
      randomTeamDrinkLastTeamIndex = pickedTeam.teamIndex
      randomTeamDrinkPickedTeamName = pickedTeam.teamName
    } else if (tileId === START_TILE_ID) {
      tileEventPhotoSrc = START_LAP_IMAGE
      tileEventStartLapCount = playerAfterLand.lapCount + pending.lapGain
    } else if (isIslandTile(tileId)) {
      tileEventPhotoSrc = ISLAND_IMAGE
    }

    return {
      ...prev,
      players,
      isMoving: false,
      tokenJump: null,
      message,
      showTileEventModal: true,
      tileEventTileId: tileId,
      tileEventVisualKey: visualKey,
      tileEventPhotoSrc,
      tileEventStartLapCount,
      randomMoveTargetTileId: null,
      titleEventLastImageIndex,
      titleEventImageUsedTurn,
      randomGameEventLastImageIndex,
      randomGameEventImageUsedTurn,
      cupidEventLastImageIndex,
      cupidEventImageUsedTurn,
      bridgeAlcoholEventLastImageIndex,
      bridgeAlcoholEventImageUsedTurn,
      bridgeWaterEventLastImageIndex,
      bridgeWaterEventImageUsedTurn,
      exceptEljundanEventLastImageIndex,
      exceptEljundanEventImageUsedTurn,
      randomTeamDrinkLastTeamIndex,
      randomTeamDrinkPickedTeamName,
    }
  })
}

function openLadderGame(
  setState: Dispatch<SetStateAction<GameState>>,
  pending: PendingTurnFinish,
  playerAfterLand: Player,
  tileId: number,
  landingPlayerIndex: number,
  playerCount: number,
  message: string,
) {
  const session = createLadderGameSession(tileId, landingPlayerIndex, playerCount)

  setState((prev) => {
    const players = [...prev.players]
    players[pending.playerIndex] = { ...playerAfterLand }
    return {
      ...prev,
      players,
      isMoving: false,
      tokenJump: null,
      message,
      showLadderGameModal: true,
      ladderGameSession: session,
      showTileEventModal: false,
      tileEventTileId: null,
      tileEventVisualKey: null,
      tileEventPhotoSrc: null,
      tileEventStartLapCount: null,
      randomMoveTargetTileId: null,
      showRandomMoveSlotModal: false,
      randomMoveSlotPhase: 'idle',
    }
  })
}

function tryFinishTurnWithModal(
  setState: Dispatch<SetStateAction<GameState>>,
  pendingRef: { current: PendingTurnFinish | null },
  playerIndex: number,
  player: Player,
  dice: number,
  lapGain: number,
  messages: string[],
  dicePrefix: string,
  tileId: number,
  visualKey: TileEventVisualKey,
  totalLaps: number,
) {
  const fullMessage = `${dicePrefix} ${dice}! ${messages.join(' → ')}`

  if (player.lapCount + lapGain >= totalLaps) {
    finishTurn(setState, playerIndex, player, dice, lapGain, messages, dicePrefix)
    return
  }

  const pending: PendingTurnFinish = {
    playerIndex,
    player,
    dice,
    lapGain,
    messages,
    dicePrefix,
  }
  pendingRef.current = pending
  openTileEventModal(
    setState,
    pending,
    player,
    tileId,
    visualKey,
    fullMessage,
  )
}

function tryFinishTurnOrLadder(
  setState: Dispatch<SetStateAction<GameState>>,
  pendingRef: { current: PendingTurnFinish | null },
  playerIndex: number,
  player: Player,
  dice: number,
  lapGain: number,
  messages: string[],
  dicePrefix: string,
  tileId: number,
  visualKey: TileEventVisualKey,
  totalLaps: number,
  playerCount: number,
) {
  const fullMessage = `${dicePrefix} ${dice}! ${messages.join(' → ')}`

  if (player.lapCount + lapGain >= totalLaps) {
    finishTurn(setState, playerIndex, player, dice, lapGain, messages, dicePrefix)
    return
  }

  if (isRouletteTile(tileId)) {
    const pending: PendingTurnFinish = {
      playerIndex,
      player,
      dice,
      lapGain,
      messages,
      dicePrefix,
    }
    pendingRef.current = pending
    openRouletteGame(setState, pending, player, tileId, fullMessage)
    return
  }

  if (isRandomMoveEventTile(tileId)) {
    const pending: PendingTurnFinish = {
      playerIndex,
      player,
      dice,
      lapGain,
      messages,
      dicePrefix,
    }
    pendingRef.current = pending
    openRandomMoveSlot(setState, pending, player, fullMessage)
    return
  }

  if (isLadderGameTile(tileId)) {
    const pending: PendingTurnFinish = {
      playerIndex,
      player,
      dice,
      lapGain,
      messages,
      dicePrefix,
    }
    pendingRef.current = pending
    openLadderGame(
      setState,
      pending,
      player,
      tileId,
      playerIndex,
      playerCount,
      fullMessage,
    )
    return
  }

  tryFinishTurnWithModal(
    setState,
    pendingRef,
    playerIndex,
    player,
    dice,
    lapGain,
    messages,
    dicePrefix,
    tileId,
    visualKey,
    totalLaps,
  )
}

async function tryCaptureAtPosition(
  ctx: BoardLandingContext,
  resumeSnapshot: PendingAfterCapture,
  landingPlayerIndex: number,
  landingPosition: number,
): Promise<boolean> {
  const victims = findBoardCaptureVictims(
    ctx.stateRef.current.players,
    landingPlayerIndex,
    landingPosition,
  )
  if (victims.length === 0) return false

  for (const victim of victims) {
    await animateBoardStep(
      ctx.setState,
      victim.playerIndex,
      victim.player.id,
      victim.player.position,
      0,
    )
  }

  const capturedNames = victims.map((victim) => victim.player.name)
  const victimIndices = new Set(victims.map((victim) => victim.playerIndex))

  ctx.pendingAfterCaptureRef.current = resumeSnapshot

  ctx.setState((prev) => ({
    ...prev,
    players: prev.players.map((player, index) =>
      victimIndices.has(index) ? resetPlayerToStart(player) : player,
    ),
    showCaptureModal: true,
    capturedPlayerNames: capturedNames,
    isMoving: false,
    tokenJump: null,
    message: `[잡힘] ${capturedNames.join(', ')} → 출발`,
  }))

  return true
}

async function continueFollowUpsAndFinish(
  ctx: BoardLandingContext,
  landResult: LandResult,
  startStepIndex: number,
) {
  let currentPlayer = landResult.player
  let allMessages = [...ctx.messages, ...landResult.messages]
  let lapGain = ctx.lapGainAccum + landResult.lapGain
  const playerId = currentPlayer.id

  for (let stepIndex = startStepIndex; stepIndex < landResult.followUpSteps.length; stepIndex++) {
    const step = landResult.followUpSteps[stepIndex]!
    await animateBoardStep(ctx.setState, ctx.playerIndex, playerId, step.from, step.to)
    currentPlayer = { ...currentPlayer, position: step.to }

    const resumeSnapshot: PendingAfterCapture = {
      stage: 'during-follow-up',
      playerIndex: ctx.playerIndex,
      player: currentPlayer,
      dice: ctx.dice,
      lapGainAccum: lapGain,
      messages: allMessages,
      dicePrefix: ctx.dicePrefix,
      totalLaps: ctx.totalLaps,
      playerCount: ctx.playerCount,
      landingPosition: step.to,
      landOnTileOptions: ctx.landOnTileOptions,
      landResult,
      followUpFromIndex: stepIndex + 1,
    }

    const paused = await tryCaptureAtPosition(
      ctx,
      resumeSnapshot,
      ctx.playerIndex,
      step.to,
    )
    if (paused) return
  }

  const landingTile = boardTiles[currentPlayer.position]
  const visualKey = landingTile ? getTileEventVisualKey(landingTile) : 'mission'

  tryFinishTurnOrLadder(
    ctx.setState,
    ctx.pendingTurnFinishRef,
    ctx.playerIndex,
    currentPlayer,
    ctx.dice,
    lapGain,
    allMessages,
    ctx.dicePrefix,
    currentPlayer.position,
    visualKey,
    ctx.totalLaps,
    ctx.playerCount,
  )
}

async function resolveBoardLandingWithCapture(ctx: BoardLandingContext) {
  const resumeBeforeLand: PendingAfterCapture = {
    stage: 'before-land-on-tile',
    playerIndex: ctx.playerIndex,
    player: ctx.player,
    dice: ctx.dice,
    lapGainAccum: ctx.lapGainAccum,
    messages: ctx.messages,
    dicePrefix: ctx.dicePrefix,
    totalLaps: ctx.totalLaps,
    playerCount: ctx.playerCount,
    landingPosition: ctx.landingPosition,
    landOnTileOptions: ctx.landOnTileOptions,
  }

  const pausedAtLand = await tryCaptureAtPosition(
    ctx,
    resumeBeforeLand,
    ctx.playerIndex,
    ctx.landingPosition,
  )
  if (pausedAtLand) return

  const landResult = landOnTile(
    ctx.player,
    ctx.landingPosition,
    ctx.totalLaps,
    ctx.landOnTileOptions,
  )
  await continueFollowUpsAndFinish(ctx, landResult, 0)
}

async function resumeAfterCapture(
  ctx: BoardLandingContext,
  pending: PendingAfterCapture,
) {
  if (pending.stage === 'before-land-on-tile') {
    const landResult = landOnTile(
      pending.player,
      pending.landingPosition,
      pending.totalLaps,
      pending.landOnTileOptions,
    )
    const resumeCtx: BoardLandingContext = {
      ...ctx,
      playerIndex: pending.playerIndex,
      player: pending.player,
      dice: pending.dice,
      lapGainAccum: pending.lapGainAccum,
      messages: pending.messages,
      dicePrefix: pending.dicePrefix,
      totalLaps: pending.totalLaps,
      playerCount: pending.playerCount,
      landingPosition: pending.landingPosition,
      landOnTileOptions: pending.landOnTileOptions,
    }
    await continueFollowUpsAndFinish(resumeCtx, landResult, 0)
    return
  }

  if (!pending.landResult || pending.followUpFromIndex == null) return

  const resumeCtx: BoardLandingContext = {
    ...ctx,
    playerIndex: pending.playerIndex,
    player: pending.player,
    dice: pending.dice,
    lapGainAccum: pending.lapGainAccum,
    messages: pending.messages,
    dicePrefix: pending.dicePrefix,
    totalLaps: pending.totalLaps,
    playerCount: pending.playerCount,
    landingPosition: pending.landingPosition,
    landOnTileOptions: pending.landOnTileOptions,
  }
  await continueFollowUpsAndFinish(resumeCtx, pending.landResult, pending.followUpFromIndex)
}

async function runBoardTurn(
  setState: Dispatch<SetStateAction<GameState>>,
  stateRef: { current: GameState },
  pendingAfterCaptureRef: { current: PendingAfterCapture | null },
  playerIndex: number,
  dice: number,
  initialPlayer: Player,
  totalLaps: number,
  pendingTurnFinishRef: { current: PendingTurnFinish | null },
  playerCount: number,
) {
  if (mustUseIslandEscapeDice(initialPlayer)) {
    setState((prev) => ({
      ...prev,
      isMoving: false,
      message: `${initialPlayer.name}님은 무인도에 있습니다. 탈출 주사위를 굴려 주세요!`,
    }))
    return
  }

  setState((prev) => ({ ...prev, isMoving: true }))

  try {
    const playerId = initialPlayer.id
    const startPos = initialPlayer.position
    const moveSteps = capForwardSteps(startPos, dice, initialPlayer.lapCount, totalLaps)

    const dicePath = buildPath(startPos, moveSteps)
    await animateBoardPath(setState, playerIndex, playerId, dicePath, startPos)

    const landingPos = dicePath.length > 0 ? dicePath[dicePath.length - 1] : startPos

    await resolveBoardLandingWithCapture({
      setState,
      stateRef,
      pendingAfterCaptureRef,
      pendingTurnFinishRef,
      playerIndex,
      player: { ...initialPlayer, position: landingPos },
      dice,
      lapGainAccum: forwardLapGain(startPos, moveSteps),
      messages: [],
      dicePrefix: '🎲',
      totalLaps,
      playerCount,
      landingPosition: landingPos,
    })
  } catch (error) {
    console.error('턴 처리 중 오류:', error)
    setState((prev) => ({
      ...prev,
      isMoving: false,
      tokenJump: null,
      message: '이동 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
    }))
  }
}

async function runBridgeTurn(
  setState: Dispatch<SetStateAction<GameState>>,
  stateRef: { current: GameState },
  pendingAfterCaptureRef: { current: PendingAfterCapture | null },
  playerIndex: number,
  dice: number,
  initialPlayer: Player,
  totalLaps: number,
  pendingTurnFinishRef: { current: PendingTurnFinish | null },
  playerCount: number,
) {
  setState((prev) => ({ ...prev, isMoving: true }))

  try {
    const playerId = initialPlayer.id
    let player = { ...initialPlayer }
    const messages: string[] = []

    const fromEntrance = player.bridgeStatus === 'pending'
    const startSegment = fromEntrance ? -1 : (player.bridgeSegment ?? 0)
    const { path, exits } = fromEntrance
      ? resolveBridgeMoveFromEntrance(dice)
      : resolveBridgeMove(startSegment, dice)

    let prevSegment = startSegment
    for (const segment of path) {
      if (prevSegment < 0) {
        messages.push(`[${BRIDGE_ENTRANCE}] 주당의 길로 ${dice}칸 이동!`)
      }
      await animateBridgeStep(
        setState,
        playerIndex,
        playerId,
        prevSegment < 0 ? -1 : prevSegment,
        segment,
      )
      prevSegment = segment
    }

    if (path.length > 0) {
      const landingSegment = path[path.length - 1]
      player = applyBridgeSegmentEffect(
        {
          ...player,
          bridgeStatus: 'on',
          bridgeSegment: landingSegment,
          position: BRIDGE_ENTRANCE,
        },
        landingSegment,
      )
      messages.push(bridgeSegmentMessage(landingSegment))
    }

    if (exits) {
      const exitSegment = path.length > 0 ? path[path.length - 1] : Math.max(startSegment, 0)
      messages.push(`[주당의 길] 탈출! ${BRIDGE_EXIT}번으로 이동합니다`)
      await animateBridgeExit(setState, playerIndex, playerId, exitSegment, BRIDGE_EXIT)

      player = {
        ...player,
        bridgeStatus: 'none',
        bridgeSegment: null,
        position: BRIDGE_EXIT,
      }

      await resolveBoardLandingWithCapture({
        setState,
        stateRef,
        pendingAfterCaptureRef,
        pendingTurnFinishRef,
        playerIndex,
        player,
        dice,
        lapGainAccum: 0,
        messages,
        dicePrefix: '🍻',
        totalLaps,
        playerCount,
        landingPosition: BRIDGE_EXIT,
        landOnTileOptions: { skipBridge: true },
      })
      return
    }

    setState((prev) => {
      const players = [...prev.players]
      players[playerIndex] = player
      return {
        ...prev,
        players,
      }
    })

    const landingSegment = path.length > 0 ? path[path.length - 1] : null
    const segmentType = landingSegment != null ? BRIDGE_SEGMENTS[landingSegment].type : 'alcohol'
    const bridgeVisualKey: TileEventVisualKey =
      segmentType === 'water' ? 'bridge-water' : 'bridge-alcohol'

    tryFinishTurnWithModal(
      setState,
      pendingTurnFinishRef,
      playerIndex,
      player,
      dice,
      0,
      messages,
      '🍻',
      BRIDGE_ENTRANCE,
      bridgeVisualKey,
      totalLaps,
    )
  } catch (error) {
    console.error('다리 턴 처리 중 오류:', error)
    setState((prev) => ({
      ...prev,
      isMoving: false,
      tokenJump: null,
      message: '주당의 길 이동 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
    }))
  }
}

async function runIslandEscapeTurn(
  setState: Dispatch<SetStateAction<GameState>>,
  stateRef: { current: GameState },
  pendingAfterCaptureRef: { current: PendingAfterCapture | null },
  playerIndex: number,
  d1: number,
  d2: number,
  initialPlayer: Player,
  totalLaps: number,
  pendingTurnFinishRef: { current: PendingTurnFinish | null },
  playerCount: number,
) {
  const player = { ...initialPlayer }

  if (d1 !== d2) {
    const turnsLeft = Math.max(0, player.islandEscapeTurnsLeft - 1)
    const updatedPlayer: Player = {
      ...player,
      islandEscapeTurnsLeft: turnsLeft,
      islandStatus: turnsLeft > 0 ? 'stranded' : 'none',
    }

    setState((prev) => {
      const players = [...prev.players]
      players[playerIndex] = updatedPlayer
      return {
        ...prev,
        players,
        dice: null,
        islandEscapeDice1: null,
        islandEscapeDice2: null,
        isMoving: false,
        showIslandEscapeModal: false,
      }
    })

    const failMessage =
      turnsLeft > 0
        ? `[무인도] ${d1}, ${d2} — 탈출 실패! (남은 시도 ${turnsLeft}턴)`
        : `[무인도] ${d1}, ${d2} — 탈출 실패! 이제 일반 주사위로 이동할 수 있습니다`

    finishTurn(
      setState,
      playerIndex,
      updatedPlayer,
      d1,
      0,
      [failMessage],
      '🏝️',
    )
    return
  }

  const steps = d1 + d2
  const clearedPlayer: Player = {
    ...player,
    islandStatus: 'none',
    islandEscapeTurnsLeft: 0,
  }

  setState((prev) => {
    const players = [...prev.players]
    players[playerIndex] = clearedPlayer
    return {
      ...prev,
      players,
      dice: null,
      islandEscapeDice1: null,
      islandEscapeDice2: null,
      isMoving: true,
      showIslandEscapeModal: false,
    }
  })

  try {
    const playerId = clearedPlayer.id
    const startPos = clearedPlayer.position
    const moveSteps = capForwardSteps(startPos, steps, clearedPlayer.lapCount, totalLaps)
    const dicePath = buildPath(startPos, moveSteps)

    await animateBoardPath(setState, playerIndex, playerId, dicePath, startPos)

    const landingPos = dicePath.length > 0 ? dicePath[dicePath.length - 1] : startPos

    await resolveBoardLandingWithCapture({
      setState,
      stateRef,
      pendingAfterCaptureRef,
      pendingTurnFinishRef,
      playerIndex,
      player: { ...clearedPlayer, position: landingPos },
      dice: steps,
      lapGainAccum: forwardLapGain(startPos, moveSteps),
      messages: [`[무인도] 더블 ${d1}! ${d1}+${d2}=${steps}칸 탈출!`],
      dicePrefix: '🏝️',
      totalLaps,
      playerCount,
      landingPosition: landingPos,
    })
  } catch (error) {
    console.error('무인도 탈출 처리 중 오류:', error)
    setState((prev) => ({
      ...prev,
      isMoving: false,
      tokenJump: null,
      message: '무인도 탈출 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
    }))
  }
}

async function runRouletteMoveTurn(
  setState: Dispatch<SetStateAction<GameState>>,
  stateRef: { current: GameState },
  pendingAfterCaptureRef: { current: PendingAfterCapture | null },
  pending: PendingTurnFinish,
  resultSegment: RouletteSegment,
  totalLaps: number,
  pendingTurnFinishRef: { current: PendingTurnFinish | null },
  playerCount: number,
) {
  const playerIndex = pending.playerIndex
  const initialPlayer = pending.player
  const moveSteps = resolveMoveRouletteSteps(resultSegment, initialPlayer.position)
  const resultMessages = [...pending.messages, `[이동 룰렛] ${resultSegment.label}`]

  if (moveSteps === 0) {
    finishTurn(
      setState,
      playerIndex,
      initialPlayer,
      pending.dice,
      pending.lapGain,
      resultMessages,
      pending.dicePrefix,
    )
    return
  }

  setState((prev) => ({ ...prev, isMoving: true }))

  try {
    const playerId = initialPlayer.id
    const startPos = initialPlayer.position
    const cappedSteps = capForwardSteps(
      startPos,
      moveSteps,
      initialPlayer.lapCount,
      totalLaps,
    )
    const dicePath = buildPath(startPos, cappedSteps)

    await animateBoardPath(setState, playerIndex, playerId, dicePath, startPos)

    const landingPos = dicePath.length > 0 ? dicePath[dicePath.length - 1] : startPos

    await resolveBoardLandingWithCapture({
      setState,
      stateRef,
      pendingAfterCaptureRef,
      pendingTurnFinishRef,
      playerIndex,
      player: { ...initialPlayer, position: landingPos },
      dice: pending.dice,
      lapGainAccum: pending.lapGain + forwardLapGain(startPos, cappedSteps),
      messages: resultMessages,
      dicePrefix: pending.dicePrefix,
      totalLaps,
      playerCount,
      landingPosition: landingPos,
    })
  } catch (error) {
    console.error('이동 룰렛 처리 중 오류:', error)
    setState((prev) => ({
      ...prev,
      isMoving: false,
      tokenJump: null,
      message: '이동 룰렛 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
    }))
  }
}

async function runRandomMoveTurn(
  setState: Dispatch<SetStateAction<GameState>>,
  stateRef: { current: GameState },
  pendingAfterCaptureRef: { current: PendingAfterCapture | null },
  pending: PendingTurnFinish,
  targetTileId: number,
  totalLaps: number,
  pendingTurnFinishRef: { current: PendingTurnFinish | null },
  playerCount: number,
) {
  const playerIndex = pending.playerIndex
  const initialPlayer = pending.player
  const fromPos = initialPlayer.position
  const targetTile = boardTiles[targetTileId]
  const resultMessages = [
    ...pending.messages,
    `[랜덤이동] ${targetTile?.name ?? '이동 칸'} (${targetTileId}번)으로 순간이동`,
  ]

  setState((prev) => ({ ...prev, isMoving: true }))

  try {
    const steps = shortestStepsToTarget(fromPos, targetTileId)
    const cappedSteps = capForwardSteps(
      fromPos,
      steps,
      initialPlayer.lapCount,
      totalLaps,
    )

    await sleep(RANDOM_MOVE_TELEPORT_DELAY_MS)

    setState((prev) => {
      const players = [...prev.players]
      players[playerIndex] = { ...players[playerIndex], position: targetTileId }
      return { ...prev, players, tokenJump: null, isMoving: true }
    })

    await resolveBoardLandingWithCapture({
      setState,
      stateRef,
      pendingAfterCaptureRef,
      pendingTurnFinishRef,
      playerIndex,
      player: { ...initialPlayer, position: targetTileId },
      dice: pending.dice,
      lapGainAccum:
        pending.lapGain +
        (cappedSteps > 0 ? forwardLapGain(fromPos, cappedSteps) : 0),
      messages: resultMessages,
      dicePrefix: pending.dicePrefix,
      totalLaps,
      playerCount,
      landingPosition: targetTileId,
    })
  } catch (error) {
    console.error('랜덤이동 처리 중 오류:', error)
    setState((prev) => ({
      ...prev,
      isMoving: false,
      tokenJump: null,
      message: '랜덤이동 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
    }))
  }
}

function isBridgeTurn(player: Player): boolean {
  return player.bridgeStatus === 'pending' || player.bridgeStatus === 'on'
}

export function useGame(config: GameConfig) {
  const [state, setState] = useState(() => createInitialState(config))

  useEffect(() => {
    setState((prev) => {
      const needsAlcohol = !Array.isArray(prev.bridgeAlcoholEventImageUsedTurn)
      const needsWater = !Array.isArray(prev.bridgeWaterEventImageUsedTurn)
      const needsExceptEljundan = !Array.isArray(prev.exceptEljundanEventImageUsedTurn)
      if (!needsAlcohol && !needsWater && !needsExceptEljundan) return prev

      return {
        ...prev,
        ...(needsAlcohol
          ? {
              bridgeAlcoholEventLastImageIndex: prev.bridgeAlcoholEventLastImageIndex ?? null,
              bridgeAlcoholEventImageUsedTurn: createInitialBridgeAlcoholImageUsedTurn(),
            }
          : {}),
        ...(needsWater
          ? {
              bridgeWaterEventLastImageIndex: prev.bridgeWaterEventLastImageIndex ?? null,
              bridgeWaterEventImageUsedTurn: createInitialBridgeWaterImageUsedTurn(),
            }
          : {}),
        ...(needsExceptEljundan
          ? {
              exceptEljundanEventLastImageIndex: prev.exceptEljundanEventLastImageIndex ?? null,
              exceptEljundanEventImageUsedTurn: createInitialExceptEljundanImageUsedTurn(),
            }
          : {}),
      }
    })
  }, [])

  const turnLockRef = useRef(false)
  const pendingTurnFinishRef = useRef<PendingTurnFinish | null>(null)
  const pendingAfterCaptureRef = useRef<PendingAfterCapture | null>(null)
  const rouletteResultSegmentRef = useRef<RouletteSegment | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const currentPlayer =
    state.players[state.currentPlayerIndex] ?? state.players[0]

  const isBridgeMode = currentPlayer
    ? isBridgeTurn(currentPlayer)
    : false

  const mainRollDisabled =
    state.showIslandEscapeModal ||
    (currentPlayer ? mustUseIslandEscapeDice(currentPlayer) : false)

  const roll = useCallback(() => {
    if (
      stateRef.current.isFinished ||
      stateRef.current.isRolling ||
      stateRef.current.isMoving ||
      stateRef.current.showDiceModal ||
      stateRef.current.showTileEventModal ||
      stateRef.current.showRandomMoveSlotModal ||
      stateRef.current.showLadderGameModal ||
      stateRef.current.showRouletteModal ||
      stateRef.current.showIslandEscapeModal ||
      stateRef.current.showCaptureModal ||
      stateRef.current.showForbiddenWordInputModal ||
      stateRef.current.showForbiddenWordWarningModal ||
      stateRef.current.showForbiddenWordRevealModal ||
      stateRef.current.showPlayerItemUseConfirmModal ||
      turnLockRef.current
    ) {
      return
    }

    const playerIndex = stateRef.current.currentPlayerIndex
    const playerSnapshot = stateRef.current.players[playerIndex]

    if (!playerSnapshot || mustUseIslandEscapeDice(playerSnapshot)) {
      return
    }

    const bridgeTurn = isBridgeTurn(playerSnapshot)

    setState((prev) => ({
      ...prev,
      isRolling: true,
      showDiceModal: true,
      dice: null,
    }))

    setTimeout(() => {
      if (turnLockRef.current) return

      const dice = bridgeTurn ? rollBridgeDice() : rollDice()

      setState((prev) => ({ ...prev, dice, isRolling: false }))

      setTimeout(() => {
        setState((prev) => ({ ...prev, showDiceModal: false }))
        turnLockRef.current = true

        const run = bridgeTurn ? runBridgeTurn : runBoardTurn
        void run(
          setState,
          stateRef,
          pendingAfterCaptureRef,
          playerIndex,
          dice,
          playerSnapshot,
          stateRef.current.totalLaps,
          pendingTurnFinishRef,
          stateRef.current.players.length,
        ).finally(() => {
          turnLockRef.current = false
        })
      }, DICE_RESULT_HOLD_MS)
    }, DICE_ROLL_MS)
  }, [])

  const rollIslandEscape = useCallback(() => {
    if (
      stateRef.current.isFinished ||
      stateRef.current.isRolling ||
      stateRef.current.isMoving ||
      !stateRef.current.showIslandEscapeModal ||
      stateRef.current.islandEscapeDice1 !== null ||
      turnLockRef.current
    ) {
      return
    }

    const playerIndex = stateRef.current.currentPlayerIndex
    const playerSnapshot = stateRef.current.players[playerIndex]

    if (!playerSnapshot || !mustUseIslandEscapeDice(playerSnapshot)) {
      return
    }

    setState((prev) => ({
      ...prev,
      isRolling: true,
      islandEscapeDice1: null,
      islandEscapeDice2: null,
    }))

    setTimeout(() => {
      if (turnLockRef.current) return

      const d1 = rollDice()
      const d2 = rollDice()

      setState((prev) => ({
        ...prev,
        islandEscapeDice1: d1,
        islandEscapeDice2: d2,
        isRolling: false,
      }))

      setTimeout(() => {
        turnLockRef.current = true

        void runIslandEscapeTurn(
          setState,
          stateRef,
          pendingAfterCaptureRef,
          playerIndex,
          d1,
          d2,
          playerSnapshot,
          stateRef.current.totalLaps,
          pendingTurnFinishRef,
          stateRef.current.players.length,
        ).finally(() => {
          turnLockRef.current = false
          setState((prev) => ({
            ...prev,
            islandEscapeDice1: null,
            islandEscapeDice2: null,
          }))
        })
      }, DICE_RESULT_HOLD_MS)
    }, DICE_ROLL_MS)
  }, [])

  const dismissTileEventModal = useCallback(() => {
    const pending = pendingTurnFinishRef.current

    if (!pending) {
      setState((prev) => ({
        ...prev,
      showTileEventModal: false,
      tileEventTileId: null,
      tileEventVisualKey: null,
      tileEventPhotoSrc: null,
      tileEventStartLapCount: null,
      randomMoveTargetTileId: null,
      randomTeamDrinkPickedTeamName: null,
    }))
      return
    }

    pendingTurnFinishRef.current = null
    setState((prev) => ({
      ...prev,
      showTileEventModal: false,
      tileEventTileId: null,
      tileEventVisualKey: null,
      tileEventPhotoSrc: null,
      tileEventStartLapCount: null,
      randomMoveTargetTileId: null,
      randomTeamDrinkPickedTeamName: null,
    }))

    let playerToFinish =
      stateRef.current.players[pending.playerIndex] ?? pending.player
    if (isIslandTile(playerToFinish.position)) {
      playerToFinish = markIslandStranded(playerToFinish)
    }

    finishTurn(
      setState,
      pending.playerIndex,
      playerToFinish,
      pending.dice,
      pending.lapGain,
      pending.messages,
      pending.dicePrefix,
    )
  }, [])

  const dismissCaptureModal = useCallback(() => {
    const pending = pendingAfterCaptureRef.current
    pendingAfterCaptureRef.current = null

    setState((prev) => ({
      ...prev,
      showCaptureModal: false,
      capturedPlayerNames: [],
    }))

    if (!pending) return

    setState((prev) => ({ ...prev, isMoving: true }))

    const landingCtx: BoardLandingContext = {
      setState,
      stateRef,
      pendingAfterCaptureRef,
      pendingTurnFinishRef,
      playerIndex: pending.playerIndex,
      player: pending.player,
      dice: pending.dice,
      lapGainAccum: pending.lapGainAccum,
      messages: pending.messages,
      dicePrefix: pending.dicePrefix,
      totalLaps: pending.totalLaps,
      playerCount: pending.playerCount,
      landingPosition: pending.landingPosition,
      landOnTileOptions: pending.landOnTileOptions,
    }

    void resumeAfterCapture(landingCtx, pending).catch((error) => {
      console.error('잡힌 후 턴 처리 중 오류:', error)
      setState((prev) => ({
        ...prev,
        isMoving: false,
        tokenJump: null,
        message: '잡힌 후 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
      }))
    })
  }, [])

  const selectLadderColumn = useCallback((col: number) => {
    setState((prev) => {
      const session = prev.ladderGameSession
      if (!session || session.phase !== 'select') return prev
      if (session.pickStep >= session.selectionOrder.length) return prev

      const taken = new Set(
        Object.values(session.columnByPlayerId).filter(
          (c): c is number => c !== undefined,
        ),
      )
      if (taken.has(col)) return prev

      const pickerIndex = session.selectionOrder[session.pickStep]
      const picker = prev.players[pickerIndex]
      if (!picker) return prev

      return {
        ...prev,
        ladderGameSession: {
          ...session,
          pickStep: session.pickStep + 1,
          columnByPlayerId: {
            ...session.columnByPlayerId,
            [picker.id]: col,
          },
        },
      }
    })
  }, [])

  const swapLadderSelections = useCallback((playerIdA: number, playerIdB: number) => {
    setState((prev) => {
      const session = prev.ladderGameSession
      if (!session || session.phase !== 'select') return prev
      if (session.pickStep < session.selectionOrder.length) return prev

      const colA = session.columnByPlayerId[playerIdA]
      const colB = session.columnByPlayerId[playerIdB]
      if (colA === undefined || colB === undefined || playerIdA === playerIdB) return prev

      return {
        ...prev,
        ladderGameSession: {
          ...session,
          columnByPlayerId: {
            ...session.columnByPlayerId,
            [playerIdA]: colB,
            [playerIdB]: colA,
          },
        },
      }
    })
  }, [])

  const startLadderGame = useCallback(() => {
    setState((prev) => {
      const session = prev.ladderGameSession
      if (!session || session.phase !== 'select') return prev
      if (session.pickStep < session.selectionOrder.length) return prev

      const columnByPlayerId = session.columnByPlayerId as Record<number, number>
      const paths = buildPlayerPaths(
        session.ladder,
        session.results,
        columnByPlayerId,
        prev.players,
      )

      return {
        ...prev,
        ladderGameSession: {
          ...session,
          phase: 'animate',
          paths,
          animationDone: false,
        },
      }
    })
  }, [])

  const completeLadderAnimation = useCallback(() => {
    setState((prev) => {
      const session = prev.ladderGameSession
      if (!session || session.phase !== 'animate') return prev

      return {
        ...prev,
        ladderGameSession: {
          ...session,
          phase: 'summary',
          animationDone: true,
        },
      }
    })
  }, [])

  const dismissLadderGame = useCallback(() => {
    const pending = pendingTurnFinishRef.current
    if (!pending) {
      setState((prev) => ({
        ...prev,
        showLadderGameModal: false,
        ladderGameSession: null,
      }))
      return
    }

    const session = stateRef.current.ladderGameSession
    pendingTurnFinishRef.current = null

    const playersWithDrinks =
      session?.paths.length
        ? applyLadderDrinks(stateRef.current.players, session.paths)
        : stateRef.current.players

    const player = playersWithDrinks[pending.playerIndex] ?? pending.player
    const ladderSummary = session?.paths
      .map((path) => {
        const p = playersWithDrinks.find((pl) => pl.id === path.playerId)
        return `${p?.name ?? '?'}: ${LADDER_RESULT_LABELS[path.result]}`
      })
      .join(', ')
    const messages = ladderSummary
      ? [...pending.messages, `[사다리] ${ladderSummary}`]
      : pending.messages

    setState((prev) => ({
      ...prev,
      players: playersWithDrinks,
      showLadderGameModal: false,
      ladderGameSession: null,
    }))

    finishTurn(
      setState,
      pending.playerIndex,
      player,
      pending.dice,
      pending.lapGain,
      messages,
      pending.dicePrefix,
    )
  }, [])

  const startRouletteSpin = useCallback(
    (targetIndex: number, nextRotationDeg: number) => {
      setState((prev) => {
        const session = prev.rouletteSession
        if (!session || session.phase !== 'idle') return prev

        return {
          ...prev,
          rouletteSession: {
            ...session,
            phase: 'spinning',
            resultIndex: targetIndex,
            rotationDeg: nextRotationDeg,
          },
        }
      })
    },
    [],
  )

  const completeRouletteSpin = useCallback(() => {
    setState((prev) => {
      const session = prev.rouletteSession
      if (!session || session.phase !== 'spinning') return prev

      if (session.resultIndex != null) {
        rouletteResultSegmentRef.current = session.segments[session.resultIndex] ?? null
      }

      return {
        ...prev,
        rouletteSession: {
          ...session,
          phase: 'result',
        },
      }
    })
  }, [])

  const dismissRouletteGame = useCallback(() => {
    const pending = pendingTurnFinishRef.current
    if (!pending) {
      rouletteResultSegmentRef.current = null
      setState((prev) => ({
        ...prev,
        showRouletteModal: false,
        rouletteSession: null,
      }))
      return
    }

    if (stateRef.current.showForbiddenWordInputModal) {
      return
    }

    const session = stateRef.current.rouletteSession
    const resultSegment =
      session?.resultIndex != null
        ? session.segments[session.resultIndex]
        : rouletteResultSegmentRef.current

    if (session && isMoveRouletteTile(session.tileId) && resultSegment) {
      pendingTurnFinishRef.current = null

      setState((prev) => ({
        ...prev,
        showRouletteModal: false,
        rouletteSession: null,
      }))

      turnLockRef.current = true
      void runRouletteMoveTurn(
        setState,
        stateRef,
        pendingAfterCaptureRef,
        pending,
        resultSegment,
        stateRef.current.totalLaps,
        pendingTurnFinishRef,
        stateRef.current.players.length,
      ).finally(() => {
        turnLockRef.current = false
      })
      return
    }

    if (
      !isMoveRouletteTile(session?.tileId ?? -1) &&
      isForbiddenWordRouletteSegment(resultSegment)
    ) {
      const playerName =
        stateRef.current.players[pending.playerIndex]?.name ?? pending.player.name

      rouletteResultSegmentRef.current = null

      setState((prev) => ({
        ...prev,
        showRouletteModal: false,
        rouletteSession: null,
        showForbiddenWordInputModal: true,
        forbiddenWordInputPlayerName: playerName,
      }))
      return
    }

    if (
      session &&
      !isMoveRouletteTile(session.tileId) &&
      isDrinkExemptionRouletteSegment(resultSegment)
    ) {
      pendingTurnFinishRef.current = null
      rouletteResultSegmentRef.current = null

      const grantedPlayer = grantPlayerItem(
        stateRef.current.players[pending.playerIndex] ?? pending.player,
        'drink-exemption',
      )

      setState((prev) => {
        const players = [...prev.players]
        players[pending.playerIndex] = grantedPlayer
        return {
          ...prev,
          players,
          showRouletteModal: false,
          rouletteSession: null,
        }
      })

      const messages = [...pending.messages, '[룰렛] 술 1잔 면제권 획득']

      finishTurn(
        setState,
        pending.playerIndex,
        grantedPlayer,
        pending.dice,
        pending.lapGain,
        messages,
        pending.dicePrefix,
      )
      return
    }

    pendingTurnFinishRef.current = null
    rouletteResultSegmentRef.current = null

    setState((prev) => {
      const players = [...prev.players]
      if (resultSegment?.drinkCount) {
        const player = players[pending.playerIndex]
        if (player) {
          players[pending.playerIndex] = {
            ...player,
            drinkCount: player.drinkCount + resultSegment.drinkCount,
          }
        }
      }

      return {
        ...prev,
        players,
        showRouletteModal: false,
        rouletteSession: null,
      }
    })

    const player = stateRef.current.players[pending.playerIndex] ?? pending.player
    const resultLabel = resultSegment?.label ?? '알 수 없음'
    const messages = [...pending.messages, `[룰렛] ${resultLabel}`]

    finishTurn(
      setState,
      pending.playerIndex,
      player,
      pending.dice,
      pending.lapGain,
      messages,
      pending.dicePrefix,
    )
  }, [])

  const submitForbiddenWord = useCallback((word: string) => {
    const trimmed = word.trim()
    if (!trimmed) return

    setState((prev) => ({
      ...prev,
      forbiddenWords: [...prev.forbiddenWords, trimmed],
      showForbiddenWordInputModal: false,
      forbiddenWordInputPlayerName: null,
    }))

    const pending = pendingTurnFinishRef.current
    if (!pending) return

    pendingTurnFinishRef.current = null

    const player = stateRef.current.players[pending.playerIndex] ?? pending.player
    const messages = [...pending.messages, `[룰렛] 금지어 추가: ${trimmed}`]

    finishTurn(
      setState,
      pending.playerIndex,
      player,
      pending.dice,
      pending.lapGain,
      messages,
      pending.dicePrefix,
    )
  }, [])

  const openForbiddenWordView = useCallback(() => {
    setState((prev) => {
      if (prev.forbiddenWords.length === 0) return prev
      return { ...prev, showForbiddenWordWarningModal: true }
    })
  }, [])

  const cancelForbiddenWordView = useCallback(() => {
    setState((prev) => ({ ...prev, showForbiddenWordWarningModal: false }))
  }, [])

  const confirmForbiddenWordView = useCallback(() => {
    setState((prev) => {
      const idx = prev.currentPlayerIndex
      const players = [...prev.players]
      const player = players[idx]
      if (player) {
        players[idx] = {
          ...player,
          drinkCount: player.drinkCount + FORBIDDEN_WORD_VIEW_DRINK_COUNT,
        }
      }

      return {
        ...prev,
        players,
        showForbiddenWordWarningModal: false,
        showForbiddenWordRevealModal: true,
        forbiddenWordRevealSecondsLeft: FORBIDDEN_WORD_REVEAL_SECONDS,
        message: `${player?.name ?? '플레이어'}님이 금지어를 확인했습니다. 술 ${FORBIDDEN_WORD_VIEW_DRINK_COUNT}잔!`,
      }
    })
  }, [])

  const tickForbiddenWordReveal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      forbiddenWordRevealSecondsLeft: Math.max(0, prev.forbiddenWordRevealSecondsLeft - 1),
    }))
  }, [])

  const completeForbiddenWordReveal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showForbiddenWordRevealModal: false,
      forbiddenWordRevealSecondsLeft: 0,
    }))
  }, [])

  const requestPlayerItemUse = useCallback(
    (playerId: number, itemId: PlayerItemId, itemIndex: number) => {
      setState((prev) => {
        const playerIndex = prev.players.findIndex((player) => player.id === playerId)
        if (playerIndex < 0) return prev
        if (prev.players[playerIndex]?.items[itemIndex] !== itemId) return prev

        return {
          ...prev,
          showPlayerItemUseConfirmModal: true,
          pendingPlayerItemUse: { playerIndex, itemId, itemIndex },
        }
      })
    },
    [],
  )

  const cancelPlayerItemUse = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showPlayerItemUseConfirmModal: false,
      pendingPlayerItemUse: null,
    }))
  }, [])

  const confirmPlayerItemUse = useCallback(() => {
    setState((prev) => {
      const pending = prev.pendingPlayerItemUse
      if (!pending) {
        return {
          ...prev,
          showPlayerItemUseConfirmModal: false,
          pendingPlayerItemUse: null,
        }
      }

      const players = [...prev.players]
      const player = players[pending.playerIndex]
      if (player && player.items[pending.itemIndex] === pending.itemId) {
        players[pending.playerIndex] = consumePlayerItemAt(player, pending.itemIndex)
      }

      return {
        ...prev,
        players,
        showPlayerItemUseConfirmModal: false,
        pendingPlayerItemUse: null,
      }
    })
  }, [])

  // DEV_TEST — 칸별 특수 기능 추가 시 대표 칸 1개만 테스트 버튼 추가 (동일 기능 중복 칸 제외)
  // 삭제 시 이 블록과 Board.tsx 테스트 버튼 함께 제거
  const goToDiceRollerDrinkTest = useCallback(() => {
    setState((prev) => {
      const result = buildTileEventModalTestUpdate(prev, 1, '주사위 굴린 사람 마셔', '🍻')
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToHongjebuDrinkTest = useCallback(() => {
    setState((prev) => {
      const result = buildTileEventModalTestUpdate(prev, 5, '홍제부 마셔', '🍻')
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToRandomMoveTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = RANDOM_MOVE_TILE_ID
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const pending: PendingTurnFinish = {
        playerIndex: idx,
        player: players[idx],
        dice: 0,
        lapGain: 0,
        messages: [`[테스트] ${players[idx].name} → ${tileId}번 ${RANDOM_MOVE_TILE_NAME}`],
        dicePrefix: '🎯',
      }
      pendingTurnFinishRef.current = pending

      return {
        ...prev,
        players,
        dice: null,
        tokenJump: null,
        message: `[테스트] ${players[idx].name} → ${tileId}번 ${RANDOM_MOVE_TILE_NAME}`,
        showRandomMoveSlotModal: true,
        randomMoveSlotPhase: 'idle',
        randomMoveTargetTileId: null,
      }
    })
  }, [])

  const randomMoveSlotItems = useMemo(() => buildRandomMoveSlotItems(boardTiles), [])

  const prepareRandomMoveSlotSpin = useCallback((): RandomMoveSlotItem | null => {
    const pending = pendingTurnFinishRef.current
    if (!pending || stateRef.current.randomMoveSlotPhase !== 'idle') {
      return null
    }

    const player = pending.player
    const targetId = pickRandomMoveTargetTileId(
      boardTiles,
      player.position,
      player.lapCount,
      stateRef.current.totalLaps,
    )
    const item = getRandomMoveSlotItem(randomMoveSlotItems, targetId)
    if (!item) return null

    setState((prev) => ({
      ...prev,
      randomMoveSlotPhase: 'spinning',
      randomMoveTargetTileId: targetId,
    }))

    return item
  }, [randomMoveSlotItems])

  const completeRandomMoveSlotSpin = useCallback((targetTileId: number) => {
    if (stateRef.current.randomMoveSlotPhase === 'result') return

    setState((prev) => ({
      ...prev,
      randomMoveSlotPhase: 'result',
      randomMoveTargetTileId: targetTileId,
    }))

    const pending = pendingTurnFinishRef.current
    if (!pending) {
      setState((prev) => ({
        ...prev,
        showRandomMoveSlotModal: false,
        randomMoveSlotPhase: 'idle',
        randomMoveTargetTileId: null,
      }))
      return
    }

    pendingTurnFinishRef.current = null

    void (async () => {
      await sleep(RANDOM_MOVE_SLOT_RESULT_HOLD_MS)

      setState((prev) => ({
        ...prev,
        showRandomMoveSlotModal: false,
        randomMoveSlotPhase: 'idle',
        randomMoveTargetTileId: null,
      }))

      turnLockRef.current = true
      try {
        await runRandomMoveTurn(
          setState,
          stateRef,
          pendingAfterCaptureRef,
          pending,
          targetTileId,
          stateRef.current.totalLaps,
          pendingTurnFinishRef,
          stateRef.current.players.length,
        )
      } finally {
        turnLockRef.current = false
      }
    })()
  }, [])

  const goToRandomGameTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = RANDOM_GAME_TILE_IDS[0]
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const picked = pickRandomGameImage(
        prev.gameTurnCount,
        prev.randomGameEventLastImageIndex,
        prev.randomGameEventImageUsedTurn,
      )
      const randomGameEventImageUsedTurn = [...prev.randomGameEventImageUsedTurn]
      randomGameEventImageUsedTurn[picked] = prev.gameTurnCount

      const result = buildTileEventModalTestUpdate(
        { ...prev, players },
        tileId,
        '내가 좋아하는 랜덤게임',
        '🎲',
        {
          tileEventPhotoSrc: RANDOM_GAME_IMAGES[picked],
          randomGameEventLastImageIndex: picked,
          randomGameEventImageUsedTurn,
        },
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToCupidTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = CUPID_TILE_IDS[0]
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const picked = pickCupidImage(
        prev.gameTurnCount,
        prev.cupidEventLastImageIndex,
        prev.cupidEventImageUsedTurn,
      )
      const cupidEventImageUsedTurn = [...prev.cupidEventImageUsedTurn]
      cupidEventImageUsedTurn[picked] = prev.gameTurnCount

      const result = buildTileEventModalTestUpdate(
        { ...prev, players },
        tileId,
        '사랑의 큐피트',
        '💘',
        {
          tileEventPhotoSrc: CUPID_IMAGES[picked],
          cupidEventLastImageIndex: picked,
          cupidEventImageUsedTurn,
        },
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToIslandTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = ISLAND_TILE_ID
      const players = [...prev.players]
      players[idx] = markIslandStranded({
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      })

      const result = buildTileEventModalTestUpdate(
        { ...prev, players },
        tileId,
        '무인도',
        '🏝️',
        {
          tileEventPhotoSrc: ISLAND_IMAGE,
        },
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToRandomTeamDrinkTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const pickedTeam = pickRandomTeamDrinkTeam(
        prev.players.map((player) => player.name),
        prev.randomTeamDrinkLastTeamIndex,
      )
      const result = buildTileEventModalTestUpdate(
        prev,
        RANDOM_TEAM_DRINK_TILE_ID,
        formatRandomTeamDrinkMessage(pickedTeam.teamName),
        '🍻',
        {
          randomTeamDrinkLastTeamIndex: pickedTeam.teamIndex,
          randomTeamDrinkPickedTeamName: pickedTeam.teamName,
        },
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToFinanceDeptDrinkTest = useCallback(() => {
    setState((prev) => {
      const result = buildTileEventModalTestUpdate(
        prev,
        FINANCE_DEPT_DRINK_TILE_ID,
        FINANCE_DEPT_DRINK_TILE_NAME,
        '🍻',
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToPresidentTeamTest = useCallback(() => {
    setState((prev) => {
      const result = buildTileEventModalTestUpdate(
        prev,
        PRESIDENT_TEAM_TILE_ID,
        PRESIDENT_TEAM_TILE_NAME,
        '🍻',
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToBottomGlassTaxTest = useCallback(() => {
    setState((prev) => {
      const result = buildTileEventModalTestUpdate(
        prev,
        BOTTOM_GLASS_TAX_TILE_ID,
        BOTTOM_GLASS_TAX_TILE_NAME,
        '🍻',
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToBridgeAlcoholTest = useCallback(() => {
    setState((prev) => {
      const result = buildBridgeSegmentModalTestUpdate(prev, 0)
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToBridgeWaterTest = useCallback(() => {
    setState((prev) => {
      const result = buildBridgeSegmentModalTestUpdate(prev, 1)
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToBombShotDrinkTest = useCallback(() => {
    setState((prev) => {
      const result = buildTileEventModalTestUpdate(
        prev,
        BOMB_SHOT_DRINK_TILE_ID,
        BOMB_SHOT_DRINK_TILE_NAME.replace('\n', ' '),
        '🍻',
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToExceptEljundanTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = EXCEPT_ELJUNDAN_TILE_ID
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const picked = pickExceptEljundanImage(
        prev.gameTurnCount,
        prev.exceptEljundanEventLastImageIndex,
        prev.exceptEljundanEventImageUsedTurn,
      )
      const exceptEljundanEventImageUsedTurn = [...prev.exceptEljundanEventImageUsedTurn]
      exceptEljundanEventImageUsedTurn[picked] = prev.gameTurnCount

      const result = buildTileEventModalTestUpdate(
        { ...prev, players },
        tileId,
        EXCEPT_ELJUNDAN_TILE_NAME,
        '🍻',
        {
          tileEventPhotoSrc: EXCEPT_ELJUNDAN_IMAGES[picked],
          exceptEljundanEventLastImageIndex: picked,
          exceptEljundanEventImageUsedTurn,
        },
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToBridgeTest = useCallback(() => {
    setState((prev) => {
      if (prev.isFinished || prev.isMoving || prev.isRolling || prev.showDiceModal) {
        return prev
      }
      const idx = prev.currentPlayerIndex
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: BRIDGE_ENTRANCE,
        bridgeStatus: 'pending',
        bridgeSegment: null,
      }
      return {
        ...prev,
        players,
        dice: null,
        tokenJump: null,
        message: `[테스트] ${players[idx].name} → ${BRIDGE_ENTRANCE}번 주당의 길 입구`,
      }
    })
  }, [])

  const goToPreFinishTest = useCallback(() => {
    setState((prev) => {
      if (prev.isFinished || prev.isMoving || prev.isRolling || prev.showDiceModal) {
        return prev
      }
      const idx = prev.currentPlayerIndex
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: PRE_FINISH_POSITION,
        lapCount: Math.max(0, prev.totalLaps - 1),
        bridgeStatus: 'none',
        bridgeSegment: null,
      }
      return {
        ...prev,
        players,
        dice: null,
        tokenJump: null,
        message: `[테스트] ${players[idx].name} → ${PRE_FINISH_POSITION}번 (출발 직전, 마지막 바퀴)`,
      }
    })
  }, [])

  const goToLadderTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = LADDER_GAME_TILE_IDS[0]
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const session = createLadderGameSession(tileId, idx, prev.players.length)

      pendingTurnFinishRef.current = {
        playerIndex: idx,
        player: players[idx],
        dice: 0,
        lapGain: 0,
        messages: [`[테스트] ${players[idx].name} → ${tileId}번 사다리타기`],
        dicePrefix: '🪜',
      }

      return {
        ...prev,
        players,
        dice: null,
        tokenJump: null,
        showLadderGameModal: true,
        ladderGameSession: session,
        message: `[테스트] ${players[idx].name} → ${tileId}번 사다리타기`,
      }
    })
  }, [])

  const goToBombChefTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = TITLE_EVENT_TILE_IDS[0]
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const picked = pickTitleEventImage(
        prev.gameTurnCount,
        prev.titleEventLastImageIndex,
        prev.titleEventImageUsedTurn,
      )
      const titleEventImageUsedTurn = [...prev.titleEventImageUsedTurn]
      titleEventImageUsedTurn[picked] = prev.gameTurnCount

      const result = buildTileEventModalTestUpdate(
        { ...prev, players },
        tileId,
        '폭탄주 요리사',
        '🍹',
        {
          tileEventPhotoSrc: BOMB_CHEF_IMAGES[picked],
          titleEventLastImageIndex: picked,
          titleEventImageUsedTurn,
        },
      )
      if (!result) return prev
      pendingTurnFinishRef.current = result.pending
      return result.state
    })
  }, [])

  const goToRouletteTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = 4
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const session = createRouletteSession(tileId)

      pendingTurnFinishRef.current = {
        playerIndex: idx,
        player: players[idx],
        dice: 0,
        lapGain: 0,
        messages: [`[테스트] ${players[idx].name} → ${tileId}번 죽음의 룰렛`],
        dicePrefix: '🎰',
      }

      return {
        ...prev,
        players,
        dice: null,
        tokenJump: null,
        showRouletteModal: true,
        rouletteSession: session,
        message: `[테스트] ${players[idx].name} → ${tileId}번 죽음의 룰렛`,
      }
    })
  }, [])

  const goToMoveRouletteTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const tileId = MOVE_ROULETTE_TILE_ID
      const players = [...prev.players]
      players[idx] = {
        ...players[idx],
        position: tileId,
        bridgeStatus: 'none',
        bridgeSegment: null,
      }

      const session = createRouletteSession(tileId)

      pendingTurnFinishRef.current = {
        playerIndex: idx,
        player: players[idx],
        dice: 0,
        lapGain: 0,
        messages: [`[테스트] ${players[idx].name} → ${tileId}번 이동 룰렛`],
        dicePrefix: '🎯',
      }

      return {
        ...prev,
        players,
        dice: null,
        tokenJump: null,
        showRouletteModal: true,
        rouletteSession: session,
        message: `[테스트] ${players[idx].name} → ${tileId}번 이동 룰렛`,
      }
    })
  }, [])

  const goToCaptureTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const capturedIndex = (idx + 1) % prev.players.length
      const capturedName = prev.players[capturedIndex]?.name ?? '플레이어 2'

      return {
        ...prev,
        showCaptureModal: true,
        capturedPlayerNames: [capturedName],
        message: `[테스트] ${formatTokenCaptureModalMessage([capturedName])}`,
      }
    })
  }, [])

  const grantDrinkExemptionItemTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const player = prev.players[idx]
      if (!player) return prev

      const players = [...prev.players]
      players[idx] = grantPlayerItem(player, 'drink-exemption')

      return {
        ...prev,
        players,
        message: `[테스트] ${player.name} → 술 1잔 면제권 획득`,
      }
    })
  }, [])

  const openForbiddenWordInputTest = useCallback(() => {
    setState((prev) => {
      if (isDevTestBlocked(prev)) {
        return prev
      }

      const idx = prev.currentPlayerIndex
      const player = prev.players[idx]
      if (!player) return prev

      return {
        ...prev,
        showForbiddenWordInputModal: true,
        forbiddenWordInputPlayerName: player.name,
        message: `[테스트] ${player.name} → 금지어 입력`,
      }
    })
  }, [])

  return {
    ...state,
    currentPlayer,
    isBridgeMode,
    mainRollDisabled,
    roll,
    rollIslandEscape,
    dismissTileEventModal,
    dismissCaptureModal,
    selectLadderColumn,
    swapLadderSelections,
    startLadderGame,
    completeLadderAnimation,
    dismissLadderGame,
    startRouletteSpin,
    completeRouletteSpin,
    dismissRouletteGame,
    submitForbiddenWord,
    openForbiddenWordView,
    cancelForbiddenWordView,
    confirmForbiddenWordView,
    tickForbiddenWordReveal,
    completeForbiddenWordReveal,
    requestPlayerItemUse,
    cancelPlayerItemUse,
    confirmPlayerItemUse,
    prepareRandomMoveSlotSpin,
    completeRandomMoveSlotSpin,
    goToDiceRollerDrinkTest,
    goToHongjebuDrinkTest,
    goToPresidentTeamTest,
    goToFinanceDeptDrinkTest,
    goToRandomTeamDrinkTest,
    goToCaptureTest,
    goToBottomGlassTaxTest,
    goToExceptEljundanTest,
    goToBombShotDrinkTest,
    goToRandomMoveTest,
    goToRandomGameTest,
    goToCupidTest,
    goToIslandTest,
    goToBridgeTest,
    goToBridgeAlcoholTest,
    goToBridgeWaterTest,
    goToPreFinishTest,
    goToLadderTest,
    goToBombChefTest,
    goToRouletteTest,
    goToMoveRouletteTest,
    grantDrinkExemptionItemTest,
    openForbiddenWordInputTest,
  }
}
