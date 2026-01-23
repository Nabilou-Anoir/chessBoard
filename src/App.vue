<script setup>
import { ref } from 'vue'
import ChessService from './services/ChessService'

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const majorPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
const pieceLabels = {
  king: 'K',
  queen: 'Q',
  rook: 'R',
  bishop: 'B',
  knight: 'N',
  pawn: 'P'
}
const pieceNames = {
  king: 'Roi',
  queen: 'Dame',
  rook: 'Tour',
  bishop: 'Fou',
  knight: 'Cavalier',
  pawn: 'Pion'
}

const createInitialBoard = () => {
  const layout = []
  for (let rowIndex = 0; rowIndex < ranks.length; rowIndex += 1) {
    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      layout.push({
        id: `${files[fileIndex]}${ranks[rowIndex]}`,
        file: files[fileIndex],
        rank: ranks[rowIndex],
        isDark: (rowIndex + fileIndex) % 2 === 1,
        piece: initialPieceFor(rowIndex, fileIndex)
      })
    }
  }
  return layout
}

const initialPieceFor = (rowIndex, fileIndex) => {
  if (rowIndex === 0) return { type: majorPieces[fileIndex], color: 'black' }
  if (rowIndex === 1) return { type: 'pawn', color: 'black' }
  if (rowIndex === 6) return { type: 'pawn', color: 'white' }
  if (rowIndex === 7) return { type: majorPieces[fileIndex], color: 'white' }
  return null
}

const boardSquares = ref(createInitialBoard())
const draggingPiece = ref(null)
const originIndex = ref(null)

const tracker = ref(new ChessService(boardSquares.value))
const trackedPositions = ref(tracker.value.getPositions())
const moveHistory = ref(tracker.value.getHistory())

const syncTracker = () => {
  trackedPositions.value = tracker.value.getPositions()
  moveHistory.value = tracker.value.getHistory()
}

const handleDragStart = (event, index) => {
  const square = boardSquares.value[index]
  if (!square.piece) return

  draggingPiece.value = square.piece
  originIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', square.id)
  }
}

const handleDrop = (event, index) => {
  event.preventDefault()
  event.stopPropagation()
  if (!draggingPiece.value) return
  if (originIndex.value === null) return

  const sourceSquare = boardSquares.value[originIndex.value]
  const targetSquare = boardSquares.value[index]
  const movingPiece = draggingPiece.value
  const capturedPiece = targetSquare.piece

  boardSquares.value = boardSquares.value.map((square, idx) => {
    if (idx === originIndex.value) {
      return { ...square, piece: null }
    }
    if (idx === index) {
      return { ...square, piece: movingPiece }
    }
    return square
  })

  tracker.value.recordMove(sourceSquare.id, targetSquare.id, movingPiece, capturedPiece)
  syncTracker()
  clearDragState()
}

const handleDragEnd = () => clearDragState()

const clearDragState = () => {
  draggingPiece.value = null
  originIndex.value = null
}

const resetBoard = () => {
  boardSquares.value = createInitialBoard()
  tracker.value.reset(boardSquares.value)
  syncTracker()
  clearDragState()
}

const describeMove = (move, index) => {
  const colorLabel = move.piece.color === 'white' ? 'Blanc' : 'Noir'
  const capturedSegment = move.captured
    ? ` — capture ${move.captured.color === 'white' ? 'blanc' : 'noir'} ${pieceNames[move.captured.type]}`
    : ''
  return `${index + 1}. ${colorLabel} ${pieceNames[move.piece.type]} : ${move.from} → ${move.to}${capturedSegment}`
}

const describePosition = (entry) => {
  const colorLabel = entry.piece.color === 'white' ? 'Blanc' : 'Noir'
  return `${entry.square} · ${colorLabel} ${pieceNames[entry.piece.type]}`
}
</script>

<template>
  <main class="app-container">
    <section class="panel">
      <h1>Plateau d'échecs</h1>
      <p class="hint">Faites glisser les pièces pour les déplacer librement.</p>
      <button type="button" class="reset-button" @click="resetBoard">Réinitialiser</button>

      <div class="status-grid">
        <article class="panel-card">
          <h2>Positions actuelles</h2>
          <p v-if="!trackedPositions.length" class="empty-state">Aucune pièce sur le plateau.</p>
          <ul v-else class="positions-list">
            <li v-for="entry in trackedPositions" :key="entry.square">
              <span class="tag">{{ entry.square.toUpperCase() }}</span>
              <span>{{ describePosition(entry) }}</span>
            </li>
          </ul>
        </article>

        <article class="panel-card">
          <h2>Historique des déplacements</h2>
          <p v-if="!moveHistory.length" class="empty-state">Déplacez une pièce pour lancer l'historique.</p>
          <ol v-else class="history-list">
            <li v-for="(move, index) in moveHistory" :key="`${move.timestamp}-${index}`">
              <span class="tag">#{{ index + 1 }}</span>
              <span>{{ describeMove(move, index) }}</span>
            </li>
          </ol>
        </article>
      </div>
    </section>

    <section class="board" aria-label="Plateau d'échecs">
      <div
        v-for="(square, index) in boardSquares"
        :key="square.id"
        class="square"
        :class="{ 'square--dark': square.isDark }"
        @dragover.prevent
        @drop="handleDrop($event, index)"
      >
        <div
          v-if="square.piece"
          class="piece"
          :class="`piece--${square.piece.color}`"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @drop="handleDrop($event, index)"
        >
          {{ pieceLabels[square.piece.type] }}
        </div>
        <span v-if="square.file === 'a'" class="coordinate coordinate--rank">{{ square.rank }}</span>
        <span v-if="square.rank === 1" class="coordinate coordinate--file">{{ square.file }}</span>
      </div>
    </section>
  </main>
</template>
