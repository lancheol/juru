import { boardTiles, pathIndexToGrid } from '../../data/board'
import { BRIDGE_ENTRANCE, BRIDGE_EXIT } from '../../data/bridge'
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
