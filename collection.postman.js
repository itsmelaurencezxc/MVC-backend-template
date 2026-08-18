{
	"info": {
		"_postman_id": "d8e7f6a5-b4c3-2109-8765-43210fedcba9",
		"name": "Salary System - Full CRUD Workflow",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "1. Authentication",
			"item": [
				{
					"name": "1.1 User Register",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"userName\": \"Admin User\",\n  \"userEmail\": \"admin@gmail.com\",\n  \"userPassword\": \"testing123\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/user/register",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"user",
								"register"
							]
						}
					}
				},
				{
					"name": "1.2 User Login (Auto-save Bearer Token)",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"const response = pm.response.json();",
									"if (response.data && response.data.token) {",
									"    pm.environment.set(\"authToken\", response.data.token);",
									"    console.log(\"Auth Token successfully extracted and saved!\");",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"userEmail\": \"admin@gmail.com\",\n  \"userPassword\": \"testing123\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/user/login",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"user",
								"login"
							]
						}
					}
				}
			]
		},
		{
			"name": "2. Business - Payout Periods",
			"item": [
				{
					"name": "2.1 Create Payout Period (Auto-save ID)",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"const response = pm.response.json();",
									"if (response.data && response.data.id) {",
									"    pm.environment.set(\"payoutPeriodId\", response.data.id);",
									"    console.log(\"Payout Period ID saved!\");",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Authorization",
								"value": "Bearer {{authToken}}"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"period\": \"8.18.2026 - 8.25.2026\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/business/payout-period",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"payout-period"
							]
						}
					}
				},
				{
					"name": "2.2 Get All Payout Periods",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/business/payout-period",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"payout-period"
							]
						}
					}
				},
				{
					"name": "2.3 Update Payout Period Date",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Authorization",
								"value": "Bearer {{authToken}}"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"period\": \"8.18.2026 - 8.31.2026\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/business/payout-period/{{payoutPeriodId}}",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"payout-period",
								"{{payoutPeriodId}}"
							]
						}
					}
				},
				{
					"name": "2.4 Delete Payout Period (Archive Tab)",
					"request": {
						"method": "DELETE",
						"header": [
							{
								"key": "Authorization",
								"value": "Bearer {{authToken}}"
							}
						],
						"url": {
							"raw": "{{baseUrl}}/business/payout-period/{{payoutPeriodId}}",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"payout-period",
								"{{payoutPeriodId}}"
							]
						}
					}
				}
			]
		},
		{
			"name": "3. Business - Salary Board Records",
			"item": [
				{
					"name": "3.1 Create Salary Record (Auto-save Record ID)",
					"event": [
						{
							"listen": "test",
							"script": {
								"exec": [
									"const response = pm.response.json();",
									"if (response.data && response.data.id) {",
									"    pm.environment.set(\"salaryRecordId\", response.data.id);",
									"    console.log(\"Salary Record ID saved!\");",
									"}"
								],
								"type": "text/javascript"
							}
						}
					],
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Authorization",
								"value": "Bearer {{authToken}}"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"name\": \"Juan Dela Cruz\",\n  \"grossEarnings\": 412669000,\n  \"commissionRate\": 20,\n  \"recmats\": \"Engine Repair Parts\",\n  \"isClaimed\": false,\n  \"payoutPeriodId\": \"{{payoutPeriodId}}\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/business/salary-record",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"salary-record"
							]
						}
					}
				},
				{
					"name": "3.2 Get Records + Summary Totals",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/business/salary-record/{{payoutPeriodId}}",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"salary-record",
								"{{payoutPeriodId}}"
							]
						}
					}
				},
				{
					"name": "3.3 Update Record (Toggle Claimed Status / Edit Row)",
					"request": {
						"method": "PATCH",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							},
							{
								"key": "Authorization",
								"value": "Bearer {{authToken}}"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"isClaimed\": true\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/business/salary-record/{{salaryRecordId}}",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"salary-record",
								"{{salaryRecordId}}"
							]
						}
					}
				},
				{
					"name": "3.4 Soft Delete Record",
					"request": {
						"method": "DELETE",
						"header": [
							{
								"key": "Authorization",
								"value": "Bearer {{authToken}}"
							}
						],
						"url": {
							"raw": "{{baseUrl}}/business/salary-record/{{salaryRecordId}}",
							"host": [
								"{{baseUrl}}"
							],
							"path": [
								"business",
								"salary-record",
								"{{salaryRecordId}}"
							]
						}
					}
				}
			]
		}
	],
	"variable": [
		{
			"key": "baseUrl",
			"value": "http://localhost:8000/api"
		}
	]
}