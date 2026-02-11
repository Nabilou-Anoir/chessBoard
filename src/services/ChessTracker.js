
import { Chess } from 'chess.js'

export default class ChessTracker {
  constructor(initialSquares = []) {
    this.chess = new Chess()
    this.positions = new Map()
    this.history = []
    this.updatePositions(initialSquares)
  }

  updatePositions(squares = []) {
    this.positions.clear()
    squares.forEach((square) => {
      if (square.piece) {
        this.positions.set(square.id, { ...square.piece })
      }
    })
    // Synchronise chess.js avec la position initiale
    this.chess.reset()
    // TODO: Pour une synchronisation complète, il faudrait générer la FEN à partir de squares
  }

  isMoveLegal(from, to) {
    // chess.js attend des notations algébriques, ex: 'e2' vers 'e4'
    const moves = this.chess.moves({ square: from, verbose: true })
    return moves.some(move => move.to === to)
  }

  recordMove(fromSquareId, toSquareId, piece, capturedPiece = null) {
    if (!piece) return
    // Utilise chess.js pour valider et jouer le coup
    const move = this.chess.move({ from: fromSquareId, to: toSquareId, promotion: 'q' })
    if (!move) return // Coup illégal, on ne fait rien

    this.history.push({
      from: fromSquareId,
      to: toSquareId,
      piece: { ...piece },
      captured: capturedPiece ? { ...capturedPiece } : null,
      timestamp: new Date().toISOString()
    })

    this.positions.delete(fromSquareId)
    this.positions.set(toSquareId, { ...piece })
  }

  reset(squares = []) {
    this.chess.reset()
    this.history = []
    this.updatePositions(squares)
  }

  getPositions() {
    return Array.from(this.positions.entries()).map(([square, piece]) => ({ square, piece }))
  }

  getHistory() {
    return [...this.history]
  }
}
