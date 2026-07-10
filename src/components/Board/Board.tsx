import { boardTiles, pathIndexToGrid, PRE_FINISH_POSITION } from '../../data/board'
import { BRIDGE_ENTRANCE, BRIDGE_EXIT } from '../../data/bridge'
import { BOMB_SHOT_DRINK_TILE_ID } from '../../data/bombShotDrinkEvent'
import { BOTTOM_GLASS_TAX_TILE_ID } from '../../data/bottomGlassTaxEvent'
import { EXCEPT_ELJUNDAN_TILE_ID } from '../../data/exceptEljundanEvent'
import { ISLAND_TILE_ID } from '../../data/desertIsland'
import { MOVE_ROULETTE_TILE_ID } from '../../data/moveRoulette'
import { FINANCE_DEPT_DRINK_TILE_ID } from '../../data/financeDeptDrinkEvent'
import { RANDOM_TEAM_DRINK_TILE_ID } from '../../data/randomTeamDrinkEvent'
import { PRESIDENT_TEAM_TILE_ID } from '../../data/presidentTeamEvent'
import { RANDOM_MOVE_TILE_ID } from '../../data/randomMoveEvent'
import type { Player, TokenJump } from '../../types/game'
import type { PlayerItemId } from '../../types/playerItem'
import { Dice } from '../Dice/Dice'
import { ForbiddenWordViewButton } from '../ForbiddenWord/ForbiddenWordViewButton'
import { PlayerPanel } from '../PlayerPanel/PlayerPanel'
import { Bridge } from './Bridge'
import { BoardTile } from './BoardTile'
import { PlayerTokens } from './PlayerTokens'
import './Board.css'

interface BoardProps {
  players: Player[]
  currentPlayerIndex: number
  currentPlayer: Player
  totalLaps: number
  dice: number | null
  isRolling: boolean
  isMoving: boolean
  showDiceModal: boolean
  isFinished: boolean
  isBridgeMode: boolean
  mainRollDisabled?: boolean
  forbiddenWords?: string[]
  onForbiddenWordView?: () => void
  itemUseBusy?: boolean
  onItemClick?: (playerId: number, itemId: PlayerItemId, itemIndex: number) => void
  tokenJump: TokenJump | null
  message: string
  onRoll: () => void
  onBackToSetup: () => void
  onDiceRollerDrinkTest: () => void
  onHongjebuDrinkTest: () => void
  onPresidentTeamTest: () => void
  onFinanceDeptDrinkTest: () => void
  onRandomTeamDrinkTest: () => void
  onCaptureTest: () => void
  onBottomGlassTaxTest: () => void
  onExceptEljundanTest: () => void
  onBombShotDrinkTest: () => void
  onRandomMoveTest: () => void
  onRandomGameTest: () => void
  onCupidTest: () => void
  onIslandTest: () => void
  onBridgeTest: () => void
  onBridgeAlcoholTest: () => void
  onBridgeWaterTest: () => void
  onPreFinishTest: () => void
  onLadderTest: () => void
  onBombChefTest: () => void
  onRouletteTest: () => void
  onMoveRouletteTest: () => void
  onGrantDrinkExemptionItemTest: () => void
  onForbiddenWordInputTest: () => void
}

export function Board({
  players,
  currentPlayerIndex,
  currentPlayer,
  totalLaps,
  dice,
  isRolling,
  isMoving,
  showDiceModal,
  isFinished,
  isBridgeMode,
  mainRollDisabled = false,
  forbiddenWords = [],
  onForbiddenWordView,
  itemUseBusy = false,
  onItemClick,
  tokenJump,
  message,
  onRoll,
  onBackToSetup,
  onDiceRollerDrinkTest,
  onHongjebuDrinkTest,
  onPresidentTeamTest,
  onFinanceDeptDrinkTest,
  onRandomTeamDrinkTest,
  onCaptureTest,
  onBottomGlassTaxTest,
  onExceptEljundanTest,
  onBombShotDrinkTest,
  onRandomMoveTest,
  onRandomGameTest,
  onCupidTest,
  onIslandTest,
  onBridgeTest,
  onBridgeAlcoholTest,
  onBridgeWaterTest,
  onPreFinishTest,
  onLadderTest,
  onBombChefTest,
  onRouletteTest,
  onMoveRouletteTest,
  onGrantDrinkExemptionItemTest,
  onForbiddenWordInputTest,
}: BoardProps) {
  const statusBusy = isFinished || isMoving || isRolling || showDiceModal

  return (
    <div className="board">
      <div className="board__grid">
        {boardTiles.map((tile) => {
          const { row, col } = pathIndexToGrid(tile.id)
          return (
            <BoardTile
              key={tile.id}
              tile={tile}
              position={tile.id}
              aboveBridge={tile.id === BRIDGE_ENTRANCE || tile.id === BRIDGE_EXIT}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
            />
          )
        })}
        <Bridge />
        <div className="board__center">
          <div className="board__status">
            <p className="board__turn">
              <span
                className="board__turn-token"
                style={{ backgroundColor: currentPlayer.color }}
              />
              {isFinished ? '게임 종료' : `${currentPlayer.name}의 차례`}
            </p>
            <p className="board__message">{message}</p>
            {/* DEV_TEST — 칸별 특수 기능: 대표 칸 1개만 (동일 기능 중복 제외) */}
            <div className="board__dev-tests">
              <button
                type="button"
                className="board__dev-test"
                onClick={onDiceRollerDrinkTest}
                disabled={statusBusy}
              >
                주사위 굴린 사람 테스트 (1번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onLadderTest}
                disabled={statusBusy}
              >
                사다리타기 테스트 (2번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onBombChefTest}
                disabled={statusBusy}
              >
                폭탄주 요리사 테스트 (3번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onRouletteTest}
                disabled={statusBusy}
              >
                죽음의 룰렛 테스트 (4번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onHongjebuDrinkTest}
                disabled={statusBusy}
              >
                홍제부 마셔 테스트 (5번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onRandomGameTest}
                disabled={statusBusy}
              >
                내가 좋아하는 랜덤게임 테스트 (6번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onCupidTest}
                disabled={statusBusy}
              >
                사랑의 큐피트 테스트 (7번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onMoveRouletteTest}
                disabled={statusBusy}
              >
                이동 룰렛 테스트 ({MOVE_ROULETTE_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onIslandTest}
                disabled={statusBusy}
              >
                무인도 테스트 ({ISLAND_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onRandomMoveTest}
                disabled={statusBusy}
              >
                랜덤이동 테스트 ({RANDOM_MOVE_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onPresidentTeamTest}
                disabled={statusBusy}
              >
                회장단 마셔 테스트 ({PRESIDENT_TEAM_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onFinanceDeptDrinkTest}
                disabled={statusBusy}
              >
                재무부 마셔 테스트 ({FINANCE_DEPT_DRINK_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onRandomTeamDrinkTest}
                disabled={statusBusy}
              >
                랜덤 팀 마셔 테스트 ({RANDOM_TEAM_DRINK_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onForbiddenWordInputTest}
                disabled={statusBusy}
              >
                금지어 입력 테스트
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onGrantDrinkExemptionItemTest}
                disabled={statusBusy}
              >
                면제권 획득 테스트
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onCaptureTest}
                disabled={statusBusy}
              >
                잡힌 팀 테스트
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onBottomGlassTaxTest}
                disabled={statusBusy}
              >
                밑잔 세무조사 테스트 ({BOTTOM_GLASS_TAX_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onExceptEljundanTest}
                disabled={statusBusy}
              >
                엘준단 빼고 다 마셔 테스트 ({EXCEPT_ELJUNDAN_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onBombShotDrinkTest}
                disabled={statusBusy}
              >
                폭탄주 마셔 테스트 ({BOMB_SHOT_DRINK_TILE_ID}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onBridgeTest}
                disabled={statusBusy}
              >
                주당의 길 테스트 ({BRIDGE_ENTRANCE}번)
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onBridgeAlcoholTest}
                disabled={statusBusy}
              >
                주당의 길 술 테스트
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onBridgeWaterTest}
                disabled={statusBusy}
              >
                주당의 길 물 테스트
              </button>
              <button
                type="button"
                className="board__dev-test"
                onClick={onPreFinishTest}
                disabled={statusBusy}
              >
                완주 직전 테스트 ({PRE_FINISH_POSITION}번)
              </button>
            </div>
            {isFinished && (
              <button type="button" className="board__restart" onClick={onBackToSetup}>
                설정 화면으로
              </button>
            )}
          </div>
          <div className="board__stack">
            <PlayerPanel
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              totalLaps={totalLaps}
              itemUseBusy={itemUseBusy}
              onItemClick={onItemClick}
            />
            {forbiddenWords.length > 0 && onForbiddenWordView && (
              <ForbiddenWordViewButton
                onClick={onForbiddenWordView}
                disabled={statusBusy}
              />
            )}
            <Dice
              value={dice}
              isRolling={isRolling}
              showDiceModal={showDiceModal}
              isMoving={isMoving}
              isFinished={isFinished}
              isBridgeMode={isBridgeMode}
              mainRollDisabled={mainRollDisabled}
              onRoll={onRoll}
            />
          </div>
        </div>
        <PlayerTokens players={players} tokenJump={tokenJump} />
      </div>
    </div>
  )
}
