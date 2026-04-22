/**
 * Google Sheets sync helper
 * Syncs registration data to Google Sheets via API
 * Note: In a real app, this would typically be called from a backend server
 * to avoid exposing service account credentials to the frontend.
 * This is a placeholder - implement the actual API call in your backend.
 */

export async function syncToGoogleSheets(registrationId) {
  try {
    // In production, call a backend endpoint that handles the actual sync
    const response = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationId }),
    })

    if (!response.ok) {
      throw new Error('Failed to sync to Google Sheets')
    }

    return await response.json()
  } catch (err) {
    console.error('Google Sheets sync error:', err)
    throw err
  }
}

/**
 * Update pastor response in Google Sheets
 * Called when a pastor submits their recommendation
 */
export async function updatePastorResponseInSheets(pastorRecommendationId) {
  try {
    const response = await fetch('/api/sheets/update-pastor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pastorRecommendationId }),
    })

    if (!response.ok) {
      throw new Error('Failed to update Google Sheets')
    }

    return await response.json()
  } catch (err) {
    console.error('Google Sheets update error:', err)
    throw err
  }
}
