/**
 * ProductStore Unit Tests
 *
 * This file contains comprehensive test coverage for the ProductStore module,
 * which manages product and batch IDs for different inventory types (food, water, medicine).
 *
 * The tests use Vitest as the testing framework and test all store actions
 * to ensure proper functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductStore } from '@/stores/ProductStore.ts'
import type { InventoryType } from '@/stores/ProductStore.ts'

describe('ProductStore', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance and make it active
    setActivePinia(createPinia())
  })

  afterEach(() => {
    // Clean up after each test
  })

  /**
   * Inventory Type Tests
   *
   * These tests verify that the inventory type functionality works correctly,
   * including setting valid types and rejecting invalid types.
   */
  describe('Inventory Type Management', () => {
    /**
     * Test for setting valid inventory types
     *
     * This test verifies that:
     * 1. The setType function correctly updates the currentType when given a valid type
     * 2. All valid inventory types ('food', 'water', 'medicine') are accepted
     */
    it('should set valid inventory types', () => {
      const productStore = useProductStore()

      // Test each valid inventory type
      const validTypes: InventoryType[] = ['food', 'water', 'medicine']

      validTypes.forEach(type => {
        productStore.setType(type)
        expect(productStore.currentType).toBe(type)
      })
    })

    /**
     * Test for handling invalid inventory types
     *
     * This test verifies that:
     * 1. The setType function ignores invalid types
     * 2. The currentType remains unchanged when an invalid type is provided
     */
    it('should ignore invalid inventory types', () => {
      const productStore = useProductStore()

      // Set a known valid type first
      productStore.setType('food')
      expect(productStore.currentType).toBe('food')

      // Try to set an invalid type
      // @ts-expect-error - Testing with invalid type
      productStore.setType('invalid')

      // Current type should remain unchanged
      expect(productStore.currentType).toBe('food')
    })
  })

  /**
   * Product ID Management Tests
   *
   * These tests verify that the product ID management functionality works correctly,
   * including adding product IDs from a page and retrieving product IDs by name.
   */
  describe('Product ID Management', () => {
    /**
     * Test for adding product IDs from a page
     *
     * This test verifies that:
     * 1. The addProductIdsFromPage function correctly adds product IDs to the store
     * 2. The product IDs are stored in the correct inventory type
     * 3. The product names are properly mapped to their IDs
     */
    it('should add product IDs from a page', () => {
      const productStore = useProductStore()

      // Test with food inventory type
      productStore.setType('food')

      const foodProducts = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
        { id: 3, name: 'Orange' }
      ]

      productStore.addProductIdsFromPage(foodProducts)

      // Check that product IDs were added to the correct set
      expect(productStore.productIds.food.has(1)).toBe(true)
      expect(productStore.productIds.food.has(2)).toBe(true)
      expect(productStore.productIds.food.has(3)).toBe(true)

      // Check that product names were mapped to their IDs
      expect(productStore.productMap.food.get('apple')).toBe(1)
      expect(productStore.productMap.food.get('banana')).toBe(2)
      expect(productStore.productMap.food.get('orange')).toBe(3)

      // Test with water inventory type
      productStore.setType('water')

      const waterProducts = [
        { id: 4, name: 'Bottled Water' },
        { id: 5, name: 'Sparkling Water' }
      ]

      productStore.addProductIdsFromPage(waterProducts)

      // Check that product IDs were added to the correct set
      expect(productStore.productIds.water.has(4)).toBe(true)
      expect(productStore.productIds.water.has(5)).toBe(true)

      // Check that product names were mapped to their IDs
      expect(productStore.productMap.water.get('bottled water')).toBe(4)
      expect(productStore.productMap.water.get('sparkling water')).toBe(5)
    })

    /**
     * Test for getting product ID by name
     *
     * This test verifies that:
     * 1. The getProductId function correctly retrieves a product ID by name
     * 2. The function is case-insensitive
     * 3. The function returns undefined for non-existent products
     */
    it('should get product ID by name', () => {
      const productStore = useProductStore()

      // Add some products to the store
      productStore.setType('food')
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' }
      ])

      // Test retrieving product IDs by name
      expect(productStore.getProductId('Apple')).toBe(1)
      expect(productStore.getProductId('Banana')).toBe(2)

      // Test case insensitivity
      expect(productStore.getProductId('apple')).toBe(1)
      expect(productStore.getProductId('BANANA')).toBe(2)

      // Test non-existent product
      expect(productStore.getProductId('Orange')).toBeUndefined()

      // Test with different inventory type
      productStore.setType('water')
      expect(productStore.getProductId('Apple')).toBeUndefined()
    })
  })

  /**
   * Batch ID Management Tests
   *
   * These tests verify that the batch ID management functionality works correctly,
   * including adding batch IDs and retrieving batch IDs by product and batch details.
   */
  describe('Batch ID Management', () => {
    /**
     * Test for adding batch IDs
     *
     * This test verifies that:
     * 1. The addBatchIds function correctly adds batch IDs to the store
     * 2. The batch IDs are stored with the correct key format
     * 3. The function handles non-existent products gracefully
     */
    it('should add batch IDs for a product', () => {
      const productStore = useProductStore()

      // Add a product to the store
      productStore.setType('food')
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' }
      ])

      // Add batch IDs for the product
      const batches = [
        { id: 101, amount: '1kg', expires: '2023-12-31' },
        { id: 102, amount: '2kg', expires: '2024-01-15' }
      ]

      productStore.addBatchIds('Apple', batches)

      // Check that batch IDs were added with the correct keys
      expect(productStore.batchMap.food.get('1-1kg-2023-12-31')).toBe(101)
      expect(productStore.batchMap.food.get('1-2kg-2024-01-15')).toBe(102)

      // Test with non-existent product
      productStore.addBatchIds('Orange', batches)
      // Should not add any batch IDs since the product doesn't exist
      expect(productStore.batchMap.food.size).toBe(2)
    })

    /**
     * Test for getting batch ID by product and batch details
     *
     * This test verifies that:
     * 1. The getBatchId function correctly retrieves a batch ID by product name and batch details
     * 2. The function returns undefined for non-existent batches
     * 3. The function handles non-existent products gracefully
     */
    it('should get batch ID by product and batch details', () => {
      const productStore = useProductStore()

      // Add a product and its batches to the store
      productStore.setType('food')
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' }
      ])

      productStore.addBatchIds('Apple', [
        { id: 101, amount: '1kg', expires: '2023-12-31' },
        { id: 102, amount: '2kg', expires: '2024-01-15' }
      ])

      // Test retrieving batch IDs
      expect(productStore.getBatchId('Apple', '1kg', '2023-12-31')).toBe(101)
      expect(productStore.getBatchId('Apple', '2kg', '2024-01-15')).toBe(102)

      // Test non-existent batch
      expect(productStore.getBatchId('Apple', '3kg', '2024-02-01')).toBeUndefined()

      // Test non-existent product
      expect(productStore.getBatchId('Orange', '1kg', '2023-12-31')).toBeUndefined()

      // Test with different inventory type
      productStore.setType('water')
      expect(productStore.getBatchId('Apple', '1kg', '2023-12-31')).toBeUndefined()
    })
  })

  /**
   * Clear Product IDs Test
   *
   * This test verifies that the clearProductIds function correctly clears all product and batch IDs.
   */
  describe('Clear Product IDs', () => {
    /**
     * Test for clearing all product IDs
     *
     * This test verifies that:
     * 1. The clearProductIds function correctly clears all product and batch IDs
     * 2. All inventory types are cleared
     */
    it('should clear all product and batch IDs', () => {
      const productStore = useProductStore()

      // Add products and batches to different inventory types
      // Food
      productStore.setType('food')
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' }
      ])
      productStore.addBatchIds('Apple', [
        { id: 101, amount: '1kg', expires: '2023-12-31' }
      ])

      // Water
      productStore.setType('water')
      productStore.addProductIdsFromPage([
        { id: 2, name: 'Bottled Water' }
      ])
      productStore.addBatchIds('Bottled Water', [
        { id: 201, amount: '500ml', expires: '2024-06-30' }
      ])

      // Medicine
      productStore.setType('medicine')
      productStore.addProductIdsFromPage([
        { id: 3, name: 'Aspirin' }
      ])
      productStore.addBatchIds('Aspirin', [
        { id: 301, amount: '20 tablets', expires: '2025-03-15' }
      ])

      // Verify that data was added
      expect(productStore.productIds.food.size).toBe(1)
      expect(productStore.productMap.food.size).toBe(1)
      expect(productStore.batchMap.food.size).toBe(1)

      expect(productStore.productIds.water.size).toBe(1)
      expect(productStore.productMap.water.size).toBe(1)
      expect(productStore.batchMap.water.size).toBe(1)

      expect(productStore.productIds.medicine.size).toBe(1)
      expect(productStore.productMap.medicine.size).toBe(1)
      expect(productStore.batchMap.medicine.size).toBe(1)

      // Clear all product IDs
      productStore.clearProductIds()

      // Verify that all data was cleared
      expect(productStore.productIds.food.size).toBe(0)
      expect(productStore.productMap.food.size).toBe(0)
      expect(productStore.batchMap.food.size).toBe(0)

      expect(productStore.productIds.water.size).toBe(0)
      expect(productStore.productMap.water.size).toBe(0)
      expect(productStore.batchMap.water.size).toBe(0)

      expect(productStore.productIds.medicine.size).toBe(0)
      expect(productStore.productMap.medicine.size).toBe(0)
      expect(productStore.batchMap.medicine.size).toBe(0)
    })
  })

  /**
   * Edge Cases and Error Handling Tests
   *
   * These tests verify that the store handles edge cases and errors gracefully.
   */
  describe('Edge Cases and Error Handling', () => {
    /**
     * Test for handling duplicate product IDs
     *
     * This test verifies that:
     * 1. When adding a product with the same name but different ID, the ID is updated
     */
    it('should handle duplicate product names by updating the ID', () => {
      const productStore = useProductStore()

      productStore.setType('food')

      // Add a product
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' }
      ])

      // Add a product with the same name but different ID
      productStore.addProductIdsFromPage([
        { id: 2, name: 'Apple' }
      ])

      // The ID should be updated to the new one
      expect(productStore.getProductId('Apple')).toBe(2)
    })

    /**
     * Test for handling case sensitivity in product names
     *
     * This test verifies that:
     * 1. Product names are stored in lowercase for case-insensitive lookups
     * 2. The getProductId function works with any case
     */
    it('should handle case sensitivity in product names', () => {
      const productStore = useProductStore()

      productStore.setType('food')

      // Add products with different cases
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' },
        { id: 2, name: 'BANANA' },
        { id: 3, name: 'orange' }
      ])

      // Test retrieving with different cases
      expect(productStore.getProductId('apple')).toBe(1)
      expect(productStore.getProductId('Apple')).toBe(1)
      expect(productStore.getProductId('APPLE')).toBe(1)

      expect(productStore.getProductId('banana')).toBe(2)
      expect(productStore.getProductId('Banana')).toBe(2)
      expect(productStore.getProductId('BANANA')).toBe(2)

      expect(productStore.getProductId('orange')).toBe(3)
      expect(productStore.getProductId('Orange')).toBe(3)
      expect(productStore.getProductId('ORANGE')).toBe(3)
    })

    /**
     * Test for handling empty product arrays
     *
     * This test verifies that:
     * 1. The addProductIdsFromPage function handles empty arrays gracefully
     */
    it('should handle empty product arrays', () => {
      const productStore = useProductStore()

      productStore.setType('food')

      // Add an empty array of products
      productStore.addProductIdsFromPage([])

      // No products should be added
      expect(productStore.productIds.food.size).toBe(0)
      expect(productStore.productMap.food.size).toBe(0)
    })

    /**
     * Test for handling empty batch arrays
     *
     * This test verifies that:
     * 1. The addBatchIds function handles empty arrays gracefully
     */
    it('should handle empty batch arrays', () => {
      const productStore = useProductStore()

      productStore.setType('food')

      // Add a product
      productStore.addProductIdsFromPage([
        { id: 1, name: 'Apple' }
      ])

      // Add an empty array of batches
      productStore.addBatchIds('Apple', [])

      // No batches should be added
      expect(productStore.batchMap.food.size).toBe(0)
    })
  })
})
