import { useEffect, useRef } from 'react'

import { computeSpinRotation, pickRandomSegmentIndex } from '../../data/roulette'

import { useGame } from '../../hooks/useGame'

import type { GameConfig } from '../../types/game'

import { CaptureModal } from '../Capture/CaptureModal'
import { Board } from '../Board/Board'

import { DiceModal } from '../Dice/DiceModal'

import { IslandEscapeModal } from '../IslandEscape/IslandEscapeModal'

import { LadderGameModal } from '../LadderGame/LadderGameModal'

import {
  RandomMoveSlotModal,
  type RandomMoveSlotModalHandle,
} from '../RandomMove/RandomMoveSlotModal'

import { RouletteModal } from '../Roulette/RouletteModal'

import {
  ForbiddenWordInputModal,
} from '../ForbiddenWord/ForbiddenWordInputModal'
import { ForbiddenWordRevealModal } from '../ForbiddenWord/ForbiddenWordRevealModal'
import { ForbiddenWordWarningModal } from '../ForbiddenWord/ForbiddenWordWarningModal'

import { PlayerItemUseConfirmModal } from '../PlayerItem/PlayerItemUseConfirmModal'

import { TileEventModal } from '../TileEvent/TileEventModal'

import { VictoryModal } from '../Victory/VictoryModal'

import './Game.css'



interface GameProps {

  config: GameConfig

  onBackToSetup: () => void

}



export function Game({ config, onBackToSetup }: GameProps) {

  const {

    players,

    currentPlayerIndex,

    currentPlayer,

    totalLaps,

    dice,

    islandEscapeDice1,

    islandEscapeDice2,

    isRolling,

    isMoving,

    showDiceModal,

    showIslandEscapeModal,

    tokenJump,

    message,

    isFinished,

    isBridgeMode,

    mainRollDisabled,

    showVictoryModal,

    winnerId,

    showTileEventModal,

    tileEventTileId,

    tileEventVisualKey,

    tileEventPhotoSrc,
    tileEventStartLapCount,

    randomTeamDrinkPickedTeamName,

    showCaptureModal,

    capturedPlayerNames,

    showRandomMoveSlotModal,

    randomMoveSlotPhase,

    showLadderGameModal,

    ladderGameSession,

    showRouletteModal,

    rouletteSession,

    forbiddenWords,

    showForbiddenWordInputModal,

    forbiddenWordInputPlayerName,

    showForbiddenWordWarningModal,

    showForbiddenWordRevealModal,

    forbiddenWordRevealSecondsLeft,

    showPlayerItemUseConfirmModal,

    pendingPlayerItemUse,

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

  } = useGame(config)

  const randomMoveSlotModalRef = useRef<RandomMoveSlotModalHandle>(null)

  const rollBusy =

    isFinished ||

    isMoving ||

    isRolling ||

    showDiceModal ||

    showTileEventModal ||

    showRandomMoveSlotModal ||

    showLadderGameModal ||

    showRouletteModal ||

    showIslandEscapeModal ||

    showCaptureModal ||

    showForbiddenWordInputModal ||

    showForbiddenWordWarningModal ||

    showForbiddenWordRevealModal ||

    showPlayerItemUseConfirmModal



  const winner = winnerId != null ? players.find((p) => p.id === winnerId) : null



  useEffect(() => {

    const onKeyDown = (event: KeyboardEvent) => {

      if (event.code !== 'Space') return

      if (event.repeat) return



      if (showVictoryModal && winner != null) {

        event.preventDefault()

        onBackToSetup()

        return

      }



      if (showForbiddenWordInputModal) {
        return
      }

      if (showRouletteModal && rouletteSession?.phase === 'result') {

        event.preventDefault()

        dismissRouletteGame()

        return

      }



      if (showRouletteModal && rouletteSession?.phase === 'idle') {

        event.preventDefault()

        const targetIndex = pickRandomSegmentIndex(rouletteSession.segments.length)

        const nextRotationDeg = computeSpinRotation(

          rouletteSession.rotationDeg,

          targetIndex,

          rouletteSession.segments.length,

        )

        startRouletteSpin(targetIndex, nextRotationDeg)

        return

      }



      if (showRandomMoveSlotModal && randomMoveSlotPhase === 'idle') {

        event.preventDefault()

        randomMoveSlotModalRef.current?.spin()

        return

      }



      if (showLadderGameModal && ladderGameSession?.phase === 'summary') {

        event.preventDefault()

        dismissLadderGame()

        return

      }



      if (showTileEventModal) {

        event.preventDefault()

        dismissTileEventModal()

        return

      }



      if (showCaptureModal) {

        event.preventDefault()

        dismissCaptureModal()

        return

      }



      if (showIslandEscapeModal) {

        if (!isRolling && islandEscapeDice1 === null) {

          event.preventDefault()

          rollIslandEscape()

        }

        return

      }



      const target = event.target

      if (

        target instanceof HTMLElement &&

        target.closest('button, input, textarea, select, [contenteditable="true"]')

      ) {

        return

      }



      if (rollBusy) return



      event.preventDefault()

      roll()

    }



    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)

  }, [

    roll,

    rollIslandEscape,

    rollBusy,

    showVictoryModal,

    winner,

    onBackToSetup,

    showTileEventModal,

    showCaptureModal,

    dismissCaptureModal,

    showIslandEscapeModal,

    isRolling,

    islandEscapeDice1,

    showLadderGameModal,

    ladderGameSession,

    showRouletteModal,

    rouletteSession,

    showRandomMoveSlotModal,

    randomMoveSlotPhase,

    dismissTileEventModal,

    dismissLadderGame,

    dismissRouletteGame,

    startRouletteSpin,

    showForbiddenWordInputModal,

  ])



  if (!currentPlayer) {

    return (

      <div className="game">

        <p className="game__error">게임을 불러올 수 없습니다. 페이지를 새로고침해 주세요.</p>

      </div>

    )

  }



  return (

    <div className="game">

      <DiceModal

        open={showDiceModal}

        value={dice}

        isRolling={isRolling}

        isBridgeMode={isBridgeMode}

      />

      <IslandEscapeModal

        open={showIslandEscapeModal}

        playerName={currentPlayer.name}

        value={islandEscapeDice1}

        value2={islandEscapeDice2}

        isRolling={isRolling}

        onRoll={rollIslandEscape}

      />

      <VictoryModal

        open={showVictoryModal && winner != null}

        winnerName={winner?.name ?? ''}

        totalLaps={totalLaps}

        onBackToSetup={onBackToSetup}

      />

      <CaptureModal

        open={showCaptureModal}

        capturedPlayerNames={capturedPlayerNames}

        onClose={dismissCaptureModal}

      />

      <TileEventModal

        open={showTileEventModal}

        tileId={tileEventTileId}

        visualKey={tileEventVisualKey}

        photoSrc={tileEventPhotoSrc}
        startLapCount={tileEventStartLapCount}

        randomTeamDrinkTeamName={randomTeamDrinkPickedTeamName}

        onClose={dismissTileEventModal}

      />

      <RandomMoveSlotModal

        ref={randomMoveSlotModalRef}

        open={showRandomMoveSlotModal}

        phase={randomMoveSlotPhase}

        onPrepareSpin={prepareRandomMoveSlotSpin}

        onSpinComplete={completeRandomMoveSlotSpin}

      />

      <LadderGameModal

        open={showLadderGameModal}

        session={ladderGameSession}

        players={players}

        onSelectColumn={selectLadderColumn}

        onSwapSelections={swapLadderSelections}

        onStart={startLadderGame}

        onAnimationComplete={completeLadderAnimation}

        onDismiss={dismissLadderGame}

      />

      <RouletteModal

        open={showRouletteModal}

        session={rouletteSession}

        landingPlayerName={currentPlayer.name}

        onSpinStart={startRouletteSpin}

        onSpinEnd={completeRouletteSpin}

        onDismiss={dismissRouletteGame}

      />

      <ForbiddenWordInputModal

        open={showForbiddenWordInputModal}

        playerName={forbiddenWordInputPlayerName ?? currentPlayer.name}

        onSubmit={submitForbiddenWord}

      />

      <ForbiddenWordWarningModal

        open={showForbiddenWordWarningModal}

        onConfirm={confirmForbiddenWordView}

        onCancel={cancelForbiddenWordView}

      />

      <ForbiddenWordRevealModal

        open={showForbiddenWordRevealModal}

        words={forbiddenWords}

        secondsLeft={forbiddenWordRevealSecondsLeft}

        onTick={tickForbiddenWordReveal}

        onComplete={completeForbiddenWordReveal}

      />

      <PlayerItemUseConfirmModal
        open={showPlayerItemUseConfirmModal}
        itemId={pendingPlayerItemUse?.itemId ?? null}
        onConfirm={confirmPlayerItemUse}
        onCancel={cancelPlayerItemUse}
      />

      <Board

        players={players}

        currentPlayerIndex={currentPlayerIndex}

        currentPlayer={currentPlayer}

        totalLaps={totalLaps}

        dice={dice}

        isRolling={isRolling}

        isMoving={isMoving}

        showDiceModal={showDiceModal}

        isFinished={isFinished}

        isBridgeMode={isBridgeMode}

        mainRollDisabled={mainRollDisabled}

        forbiddenWords={forbiddenWords}

        onForbiddenWordView={openForbiddenWordView}

        itemUseBusy={showPlayerItemUseConfirmModal}

        onItemClick={requestPlayerItemUse}

        tokenJump={tokenJump}

        message={message}

        onRoll={roll}

        onBackToSetup={onBackToSetup}

        onDiceRollerDrinkTest={goToDiceRollerDrinkTest}

        onHongjebuDrinkTest={goToHongjebuDrinkTest}

        onPresidentTeamTest={goToPresidentTeamTest}

        onFinanceDeptDrinkTest={goToFinanceDeptDrinkTest}

        onRandomTeamDrinkTest={goToRandomTeamDrinkTest}

        onCaptureTest={goToCaptureTest}

        onBottomGlassTaxTest={goToBottomGlassTaxTest}

        onExceptEljundanTest={goToExceptEljundanTest}

        onBombShotDrinkTest={goToBombShotDrinkTest}

        onRandomMoveTest={goToRandomMoveTest}

        onRandomGameTest={goToRandomGameTest}

        onCupidTest={goToCupidTest}

        onIslandTest={goToIslandTest}

        onBridgeTest={goToBridgeTest}

        onBridgeAlcoholTest={goToBridgeAlcoholTest}

        onBridgeWaterTest={goToBridgeWaterTest}

        onPreFinishTest={goToPreFinishTest}

        onLadderTest={goToLadderTest}

        onBombChefTest={goToBombChefTest}

        onRouletteTest={goToRouletteTest}
        onMoveRouletteTest={goToMoveRouletteTest}
        onGrantDrinkExemptionItemTest={grantDrinkExemptionItemTest}
        onForbiddenWordInputTest={openForbiddenWordInputTest}

      />

    </div>

  )

}

