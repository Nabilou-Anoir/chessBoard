import { test, expect } from '@playwright/test'

test.describe('ChessBoard component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('affiche 64 cases et 32 pièces au chargement', async ({ page }) => {
    const board = page.getByTestId('board')
    const squares = board.locator('[data-square-id]')
    const pieces = board.locator('[data-piece]')

    await expect(squares).toHaveCount(64)
    await expect(pieces).toHaveCount(32)
  })

  test('permet de déplacer une pièce vers une case libre', async ({ page }) => {
    const fromSquare = page.locator('[data-square-id="a2"] .piece')
    const targetSquare = page.locator('[data-square-id="a3"]')

    await fromSquare.dragTo(targetSquare)

    const historyEntries = page.getByTestId('history-list').locator('li')
    await expect(historyEntries.first()).toContainText('a2 → a3')

    const positionsList = page
      .getByTestId('positions-list')
      .locator('li', { hasText: 'A3' })
    await expect(positionsList).toContainText('Blanc Pion')
  })

  test('autorise les captures et remplace la pièce cible', async ({ page }) => {
    const fromSquare = page.locator('[data-square-id="a2"] .piece')
    const targetSquare = page.locator('[data-square-id="a7"]')

    await fromSquare.dragTo(targetSquare)

    const historyEntries = page.getByTestId('history-list').locator('li')
    await expect(historyEntries.first()).toContainText('a2 → a7')
    await expect(historyEntries.first()).toContainText('capture noir Pion')

    const positionsList = page
      .getByTestId('positions-list')
      .locator('li', { hasText: 'A7' })
    await expect(positionsList).toContainText('Blanc Pion')
  })
})
