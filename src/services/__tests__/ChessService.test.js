import { describe, it, expect, beforeEach } from 'vitest'
import ChessService from '../ChessService'

const createSquare = (id, piece = null) => {
  const file = id[0]
  const rank = Number(id.slice(1))
  return {
    id,
    file,
    rank,
    isDark: false,
    piece
  }
}

const whitePawn = { type: 'pawn', color: 'white' }
const blackKnight = { type: 'knight', color: 'black' }
const blackRook = { type: 'rook', color: 'black' }

describe('ChessService', () => {
  let service
  let startingSquares

  beforeEach(() => {
    startingSquares = [
      createSquare('a2', whitePawn),
      createSquare('b8', blackKnight),
      createSquare('c3')
    ]
    service = new ChessService(startingSquares)
  })

  it('expose les positions initiales à travers getPositions', () => {
    const positions = service.getPositions()

    expect(positions).toEqual(
      expect.arrayContaining([
        { square: 'a2', piece: whitePawn },
        { square: 'b8', piece: blackKnight }
      ])
    )
    expect(positions.find((entry) => entry.square === 'c3')).toBeUndefined()
  })

  it('enregistre un déplacement et met à jour l\'historique', () => {
    service.recordMove('a2', 'c3', whitePawn)

    const positions = service.getPositions()
    expect(positions).toEqual(
      expect.arrayContaining([
        { square: 'c3', piece: whitePawn }
      ])
    )
    expect(positions.find((entry) => entry.square === 'a2')).toBeUndefined()

    const history = service.getHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({
      from: 'a2',
      to: 'c3',
      piece: whitePawn,
      captured: null
    })
    expect(typeof history[0].timestamp).toBe('string')
  })

  it('enregistre les captures et conserve les pièces remplacées', () => {
    const captureSquares = [
      createSquare('a2', whitePawn),
      createSquare('b8'),
      createSquare('c3', blackRook)
    ]
    service = new ChessService(captureSquares)

    service.recordMove('a2', 'c3', whitePawn, blackRook)

    const history = service.getHistory()
    expect(history[0]).toMatchObject({
      captured: blackRook
    })
    const positions = service.getPositions()
    expect(positions).toEqual(
      expect.arrayContaining([
        { square: 'c3', piece: whitePawn }
      ])
    )
  })

  it('reset efface l\'historique et reconstruit les positions', () => {
    service.recordMove('a2', 'c3', whitePawn)

    service.reset(startingSquares)

    expect(service.getHistory()).toHaveLength(0)
    expect(service.getPositions()).toEqual(
      expect.arrayContaining([
        { square: 'a2', piece: whitePawn },
        { square: 'b8', piece: blackKnight }
      ])
    )
  })
})
