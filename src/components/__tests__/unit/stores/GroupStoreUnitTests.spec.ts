/**
 * GroupStore Unit Tests
 *
 * This file contains comprehensive unit tests for the GroupStore, which is responsible
 * for managing group state in the application. The tests verify the store's functionality
 * including initialization, group management, product type mapping, and batch mapping.
 *
 * The GroupStore handles:
 * - Managing the current group ID
 * - Mapping product type names to their IDs
 * - Mapping batch details to batch IDs
 * - Clearing state when needed
 *
 * @file GroupStoreUnitTests.spec.ts
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGroupStore } from '@/stores/GroupStore.ts'

/**
 * Main test suite for the GroupStore
 *
 * This suite contains all tests related to the GroupStore functionality.
 * Each nested describe block focuses on a specific aspect of the store's behavior.
 */
describe('GroupStore', () => {
  /**
   * Test Setup
   *
   * Before each test:
   * 1. Create a fresh Pinia instance to ensure tests are isolated
   */
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())
  })

  /**
   * Test Teardown
   *
   * After each test, ensure a clean state for the next test.
   */
  afterEach(() => {
    // Clean up after each test
  })

  /**
   * Initialization Tests
   *
   * These tests verify the initial state of the store.
   * The store should initialize with default values for all state properties.
   */
  describe('Initialization', () => {
    /**
     * Test: Default State Initialization
     *
     * Verifies that the store initializes with the expected default values for all state properties.
     * This ensures that the store has a consistent starting point when first created.
     */
    it('should initialize with default state', () => {
      const store = useGroupStore()
      expect(store.currentGroupId).toBeNull()
      expect(store.productTypeMap).toBeInstanceOf(Map)
      expect(store.productTypeMap.size).toBe(0)
      expect(store.batchMap).toBeInstanceOf(Map)
      expect(store.batchMap.size).toBe(0)
    })
  })

  /**
   * Group Management Tests
   *
   * These tests verify the behavior of the group management functions.
   * The store should correctly set and clear the current group ID.
   */
  describe('Group Management', () => {
    /**
     * Test: Setting Current Group
     *
     * Verifies that the setCurrentGroup function correctly updates the currentGroupId state.
     */
    it('should set current group ID', () => {
      const store = useGroupStore()
      const groupId = 123

      store.setCurrentGroup(groupId)

      expect(store.currentGroupId).toBe(groupId)
    })

    /**
     * Test: Clearing Current Group
     *
     * Verifies that the clearCurrentGroup function correctly resets the currentGroupId state.
     */
    it('should clear current group ID', () => {
      const store = useGroupStore()
      const groupId = 123

      // First set a group ID
      store.setCurrentGroup(groupId)
      expect(store.currentGroupId).toBe(groupId)

      // Then clear it
      store.clearCurrentGroup()
      expect(store.currentGroupId).toBeNull()
    })
  })

  /**
   * Product Type Management Tests
   *
   * These tests verify the behavior of the product type management functions.
   * The store should correctly add, retrieve, and clear product type IDs.
   */
  describe('Product Type Management', () => {
    /**
     * Test: Adding Product Type IDs
     *
     * Verifies that the addProductTypeIds function correctly adds product type IDs to the store.
     */
    it('should add product type IDs', () => {
      const store = useGroupStore()
      const productTypes = [
        { name: 'Fruit', id: 1 },
        { name: 'Vegetable', id: 2 },
        { name: 'Dairy', id: 3 }
      ]

      store.addProductTypeIds(productTypes)

      expect(store.productTypeMap.size).toBe(3)
      expect(store.productTypeMap.get('Fruit')).toBe(1)
      expect(store.productTypeMap.get('Vegetable')).toBe(2)
      expect(store.productTypeMap.get('Dairy')).toBe(3)
    })

    /**
     * Test: Getting Product Type ID
     *
     * Verifies that the getProductTypeId function correctly retrieves a product type ID by name.
     */
    it('should get product type ID by name', () => {
      const store = useGroupStore()
      const productTypes = [
        { name: 'Fruit', id: 1 },
        { name: 'Vegetable', id: 2 }
      ]

      store.addProductTypeIds(productTypes)

      expect(store.getProductTypeId('Fruit')).toBe(1)
      expect(store.getProductTypeId('Vegetable')).toBe(2)
      expect(store.getProductTypeId('Dairy')).toBeUndefined()
    })

    /**
     * Test: Clearing Product Type IDs
     *
     * Verifies that the clearProductTypeIds function correctly clears all product type IDs.
     */
    it('should clear product type IDs', () => {
      const store = useGroupStore()
      const productTypes = [
        { name: 'Fruit', id: 1 },
        { name: 'Vegetable', id: 2 }
      ]

      store.addProductTypeIds(productTypes)
      expect(store.productTypeMap.size).toBe(2)

      store.clearProductTypeIds()
      expect(store.productTypeMap.size).toBe(0)
    })

    /**
     * Test: Updating Existing Product Type IDs
     *
     * Verifies that the addProductTypeIds function correctly updates existing product type IDs.
     */
    it('should update existing product type IDs', () => {
      const store = useGroupStore()

      // Add initial product types
      store.addProductTypeIds([
        { name: 'Fruit', id: 1 },
        { name: 'Vegetable', id: 2 }
      ])

      // Update with new IDs
      store.addProductTypeIds([
        { name: 'Fruit', id: 10 },
        { name: 'Vegetable', id: 20 }
      ])

      expect(store.productTypeMap.size).toBe(2)
      expect(store.getProductTypeId('Fruit')).toBe(10)
      expect(store.getProductTypeId('Vegetable')).toBe(20)
    })
  })

  /**
   * Batch Management Tests
   *
   * These tests verify the behavior of the batch management functions.
   * The store should correctly add, retrieve, and clear batch IDs.
   */
  describe('Batch Management', () => {
    /**
     * Test: Adding Batch IDs
     *
     * Verifies that the addBatchIds function correctly adds batch IDs to the store.
     */
    it('should add batch IDs', () => {
      const store = useGroupStore()
      const productName = 'Apple'
      const batches = [
        { id: 101, amount: '1kg', expires: '2023-12-31' },
        { id: 102, amount: '2kg', expires: '2024-01-15' }
      ]

      store.addBatchIds(productName, batches)

      expect(store.batchMap.size).toBe(2)
      expect(store.batchMap.get('Apple-1kg-2023-12-31')).toBe(101)
      expect(store.batchMap.get('Apple-2kg-2024-01-15')).toBe(102)
    })

    /**
     * Test: Getting Batch ID
     *
     * Verifies that the getBatchId function correctly retrieves a batch ID by product name and batch details.
     */
    it('should get batch ID by product name and batch details', () => {
      const store = useGroupStore()
      const productName = 'Apple'
      const batches = [
        { id: 101, amount: '1kg', expires: '2023-12-31' },
        { id: 102, amount: '2kg', expires: '2024-01-15' }
      ]

      store.addBatchIds(productName, batches)

      expect(store.getBatchId('Apple', '1kg', '2023-12-31')).toBe(101)
      expect(store.getBatchId('Apple', '2kg', '2024-01-15')).toBe(102)
      expect(store.getBatchId('Apple', '3kg', '2024-02-01')).toBeUndefined()
      expect(store.getBatchId('Banana', '1kg', '2023-12-31')).toBeUndefined()
    })

    /**
     * Test: Clearing Batch IDs
     *
     * Verifies that the clearBatchIds function correctly clears all batch IDs.
     */
    it('should clear batch IDs', () => {
      const store = useGroupStore()
      const productName = 'Apple'
      const batches = [
        { id: 101, amount: '1kg', expires: '2023-12-31' },
        { id: 102, amount: '2kg', expires: '2024-01-15' }
      ]

      store.addBatchIds(productName, batches)
      expect(store.batchMap.size).toBe(2)

      store.clearBatchIds()
      expect(store.batchMap.size).toBe(0)
    })

    /**
     * Test: Updating Existing Batch IDs
     *
     * Verifies that the addBatchIds function correctly updates existing batch IDs.
     */
    it('should update existing batch IDs', () => {
      const store = useGroupStore()
      const productName = 'Apple'

      // Add initial batches
      store.addBatchIds(productName, [
        { id: 101, amount: '1kg', expires: '2023-12-31' }
      ])

      // Update with new ID
      store.addBatchIds(productName, [
        { id: 201, amount: '1kg', expires: '2023-12-31' }
      ])

      expect(store.batchMap.size).toBe(1)
      expect(store.getBatchId('Apple', '1kg', '2023-12-31')).toBe(201)
    })
  })

  /**
   * Clear All Tests
   *
   * These tests verify the behavior of the clearAll function.
   * The store should correctly clear all state when this function is called.
   */
  describe('Clear All', () => {
    /**
     * Test: Clearing All State
     *
     * Verifies that the clearAll function correctly clears all state in the store.
     */
    it('should clear all state', () => {
      const store = useGroupStore()

      // Set up some state
      store.setCurrentGroup(123)
      store.addProductTypeIds([{ name: 'Fruit', id: 1 }])
      store.addBatchIds('Apple', [{ id: 101, amount: '1kg', expires: '2023-12-31' }])

      // Verify state was set
      expect(store.currentGroupId).toBe(123)
      expect(store.productTypeMap.size).toBe(1)
      expect(store.batchMap.size).toBe(1)

      // Clear all state
      store.clearAll()

      // Verify state was cleared
      expect(store.currentGroupId).toBeNull()
      expect(store.productTypeMap.size).toBe(0)
      expect(store.batchMap.size).toBe(0)
    })
  })

  /**
   * Edge Cases Tests
   *
   * These tests verify the behavior of the store in edge cases.
   */
  describe('Edge Cases', () => {
    /**
     * Test: Adding Empty Product Types Array
     *
     * Verifies that the addProductTypeIds function handles empty arrays gracefully.
     */
    it('should handle empty product types array', () => {
      const store = useGroupStore()

      store.addProductTypeIds([])

      expect(store.productTypeMap.size).toBe(0)
    })

    /**
     * Test: Adding Empty Batches Array
     *
     * Verifies that the addBatchIds function handles empty arrays gracefully.
     */
    it('should handle empty batches array', () => {
      const store = useGroupStore()

      store.addBatchIds('Apple', [])

      expect(store.batchMap.size).toBe(0)
    })

    /**
     * Test: Getting Product Type ID with Empty Map
     *
     * Verifies that the getProductTypeId function handles an empty map gracefully.
     */
    it('should handle getting product type ID with empty map', () => {
      const store = useGroupStore()

      expect(store.getProductTypeId('Fruit')).toBeUndefined()
    })

    /**
     * Test: Getting Batch ID with Empty Map
     *
     * Verifies that the getBatchId function handles an empty map gracefully.
     */
    it('should handle getting batch ID with empty map', () => {
      const store = useGroupStore()

      expect(store.getBatchId('Apple', '1kg', '2023-12-31')).toBeUndefined()
    })
  })
})
