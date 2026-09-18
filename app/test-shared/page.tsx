'use client'

import { User, UserStatus, loginSchema, LoginDTO, USER_STATUS } from '@specialist/shared'
import { useState } from 'react'

export default function TestSharedPage() {
  const [validationResult, setValidationResult] = useState<string>('')

  const testUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    profilePictureUrl: null,
    isAdmin: true,
    status: UserStatus.ACTIVE,
    hasClientProfile: false,
    hasProfessionalProfile: false,
    hasCompanyProfile: false,
    phoneVerified: false,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const handleValidate = () => {
    try {
      const testData: LoginDTO = {
        email: 'admin@example.com',
        password: 'password123',
      }
      const result = loginSchema.parse(testData)
      setValidationResult(`✅ Validation passed: ${JSON.stringify(result)}`)
    } catch (error) {
      setValidationResult(`❌ Validation failed: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Shared Package Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">User Type</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(testUser, null, 2)}
          </pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Constants</h2>
          <p>User Statuses: {Object.values(USER_STATUS).join(', ')}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Schema Validation</h2>
          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Login Schema
          </button>
          {validationResult && (
            <p className="mt-2 text-sm">{validationResult}</p>
          )}
        </div>

        <div className="p-4 border rounded bg-green-50">
          <p className="text-green-800 font-semibold">
            ✅ Shared package is working correctly!
          </p>
        </div>
      </div>
    </div>
  )
}


