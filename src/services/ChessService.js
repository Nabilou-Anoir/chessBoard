export default class ChessService {
  constructor(initialSquares = []) {
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
  }

  recordMove(fromSquareId, toSquareId, piece, capturedPiece = null) {
    if (!piece) return

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
