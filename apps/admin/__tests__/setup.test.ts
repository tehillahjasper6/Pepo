/**
 * Sample test file to verify Jest is configured correctly
 */
describe('Admin Dashboard Setup', () => {
  test('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })

  test('should be able to import types', () => {
    expect(typeof Object).toBe('function')
  })

  test('basic arithmetic works', () => {
    expect(2 + 2).toBe(4)
  })
})
