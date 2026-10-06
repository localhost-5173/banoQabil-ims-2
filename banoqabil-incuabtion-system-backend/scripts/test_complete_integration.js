// Comprehensive Integration Test for Bano Qabil IMS Backend <-> Landing Page Frontend
const assert = require("assert");

const BACKEND_URL = "http://localhost:5000";
const LANDING_URL = "http://localhost:5500";

async function runTests() {
  console.log("====================================================");
  console.log("🚀 STARTING COMPLETE INTEGRATION & API FLOW TEST");
  console.log("====================================================");

  // 1. Test Backend Health & Form Config Fetching
  console.log("\n[TEST 1] Fetch Form Configuration (GET /api/form-config)...");
  const formConfigRes = await fetch(`${BACKEND_URL}/api/form-config`);
  assert.strictEqual(formConfigRes.status, 200, "GET /api/form-config should return 200 OK");
  const formConfigData = await formConfigRes.json();
  assert(formConfigData.data, "Response should have 'data' property");
  console.log("✅ Form configuration fetched successfully. Sections:", Object.keys(formConfigData.data));

  // 2. Test Adding a New Dynamic Field (Admin Form Builder)
  console.log("\n[TEST 2] Admin adds a new dynamic field (POST /api/form-config)...");
  const testFieldName = `test_portfolio_${Date.now()}`;
  const addFieldRes = await fetch(`${BACKEND_URL}/api/form-config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      section: "Personal Information",
      label: "Portfolio Link",
      name: testFieldName,
      type: "text",
      placeholder: "https://yourportfolio.com",
      required: false,
      options: []
    })
  });
  assert.strictEqual(addFieldRes.status, 201, "POST /api/form-config should return 201 Created");
  const addFieldData = await addFieldRes.json();
  const createdFieldId = addFieldData.data._id;
  console.log(`✅ Dynamic field created: '${addFieldData.data.label}' (ID: ${createdFieldId}, Name: ${testFieldName})`);

  // 3. Test Form Configuration Reflects the New Dynamic Field
  console.log("\n[TEST 3] Verify Landing Page receives updated form config with the new field...");
  const refreshedRes = await fetch(`${BACKEND_URL}/api/form-config`);
  const refreshedData = await refreshedRes.json();
  const personalFields = refreshedData.data["Personal Information"] || [];
  const foundField = personalFields.find(f => f.name === testFieldName);
  assert(foundField, "Refreshed form config should contain the newly added field");
  console.log(`✅ Verified: Newly created field '${foundField.label}' appears in GET /api/form-config`);

  // 4. Test Updating Field (Admin edits label/placeholder)
  console.log("\n[TEST 4] Admin edits field label & placeholder (PUT /api/form-config/:id)...");
  const updateFieldRes = await fetch(`${BACKEND_URL}/api/form-config/${createdFieldId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label: "Updated Portfolio / GitHub URL",
      placeholder: "https://github.com/username",
      required: true
    })
  });
  assert.strictEqual(updateFieldRes.status, 200, "PUT /api/form-config/:id should return 200 OK");
  const updateData = await updateFieldRes.json();
  assert.strictEqual(updateData.data.label, "Updated Portfolio / GitHub URL");
  console.log("✅ Field updated successfully:", updateData.data.label);

  // 5. Test Deleting Dynamic Field (Admin Form Builder)
  console.log("\n[TEST 5] Admin deletes dynamic field (DELETE /api/form-config/:id)...");
  const deleteFieldRes = await fetch(`${BACKEND_URL}/api/form-config/${createdFieldId}`, {
    method: "DELETE"
  });
  assert.strictEqual(deleteFieldRes.status, 200, "DELETE /api/form-config/:id should return 200 OK");
  console.log("✅ Field deleted successfully from backend");

  // 6. Verify Deleted Field is no longer returned
  console.log("\n[TEST 6] Verify deleted field disappears from GET /api/form-config...");
  const afterDeleteRes = await fetch(`${BACKEND_URL}/api/form-config`);
  const afterDeleteData = await afterDeleteRes.json();
  const personalAfterDelete = afterDeleteData.data["Personal Information"] || [];
  const foundDeleted = personalAfterDelete.find(f => f.name === testFieldName);
  assert(!foundDeleted, "Deleted field should no longer appear in form configuration");
  console.log("✅ Verified: Deleted field no longer appears in GET /api/form-config");

  // 7. Test Submitting Registration Form (Landing Page -> Backend POST /api/registration)
  console.log("\n[TEST 7] Submitting Registration Form (POST /api/registration)...");
  const registrationPayload = {
    fullName: "ALI AHMED KHAN",
    dateOfBirth: "2002-05-14",
    gender: "Male",
    address: "House 123, Block 4, Gulshan-e-Iqbal, Karachi",
    emailAddress: `ali.test.${Date.now()}@example.com`,
    phoneNumber: "3001234567",
    guardianNumber: "3007654321",
    cnicNumber: "42101-1234567-1",
    fatherOrGuardianName: "AHMED KHAN",
    course: "Web Development with AI",
    teacherName: "Sir Kashif",
    campus: "Al-Aqsa Campus (Gulshan-e-Iqbal 13D)",
    obtainedMarks: "88%",
    aboutYou: "Passionate software engineering student eager to learn and build real-world applications.",
    dynamicData: {
      custom_experience_level: "Intermediate",
      custom_preferred_shift: "Morning",
      custom_notes: "Available for on-site internship"
    }
  };

  const regSubmitRes = await fetch(`${BACKEND_URL}/api/registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationPayload)
  });

  assert.strictEqual(regSubmitRes.status, 201, `POST /api/registration should return 201 Created (got ${regSubmitRes.status})`);
  const regSubmitData = await regSubmitRes.json();
  assert(regSubmitData.data && regSubmitData.data._id, "Submission should return registered document with _id");
  const newRegistrationId = regSubmitData.data._id;
  console.log(`✅ Registration submitted successfully! Record ID: ${newRegistrationId}`);
  console.log(`   Candidate: ${regSubmitData.data.fullName}`);
  console.log(`   Course: ${regSubmitData.data.course}`);
  console.log(`   Campus: ${regSubmitData.data.campus}`);
  console.log(`   Dynamic Data Stored:`, regSubmitData.data.dynamicData);

  // 8. Test Admin Panel Registration Retrieval (GET /api/registration & GET /api/registration/:id)
  console.log("\n[TEST 8] Fetching Registrations for Admin Panel (GET /api/registration)...");
  const allRegsRes = await fetch(`${BACKEND_URL}/api/registration`);
  assert.strictEqual(allRegsRes.status, 200, "GET /api/registration should return 200 OK");
  const allRegsData = await allRegsRes.json();
  assert(Array.isArray(allRegsData.data), "Registrations data should be an array");
  const foundSubmission = allRegsData.data.find(r => r._id === newRegistrationId);
  assert(foundSubmission, "Newly submitted registration should be retrieved by Admin Panel");
  console.log(`✅ Verified: Retrieved newly created submission from Admin list (Total Registrations: ${allRegsData.data.length})`);

  // 9. Test Single Registration Retrieval by ID (GET /api/registration/:id)
  console.log("\n[TEST 9] Fetching Single Registration by ID (GET /api/registration/:id)...");
  const singleRegRes = await fetch(`${BACKEND_URL}/api/registration/${newRegistrationId}`);
  assert.strictEqual(singleRegRes.status, 200, "GET /api/registration/:id should return 200 OK");
  const singleRegData = await singleRegRes.json();
  assert.strictEqual(singleRegData.data._id, newRegistrationId);
  assert.strictEqual(singleRegData.data.fullName, "ALI AHMED KHAN");
  assert.strictEqual(singleRegData.data.course, "Web Development with AI");
  assert.strictEqual(singleRegData.data.campus, "Al-Aqsa Campus (Gulshan-e-Iqbal 13D)");
  assert.strictEqual(singleRegData.data.dynamicData.custom_experience_level, "Intermediate");
  console.log("✅ Verified: Detailed registration fetched with all standard & dynamic fields intact!");

  // 10. Test Landing Page HTTP Serving and Assets
  console.log("\n[TEST 10] Testing Landing Page Frontend Serving (HTTP GET)...");
  const landingPageRes = await fetch(`${LANDING_URL}/index.html`);
  assert.strictEqual(landingPageRes.status, 200, "Landing page should return 200 OK");
  const htmlContent = await landingPageRes.text();
  assert(htmlContent.includes("config.js"), "index.html should load config.js");
  assert(htmlContent.includes("script.js"), "index.html should load script.js");
  assert(htmlContent.includes("form-steps-container"), "index.html should contain dynamic form container");
  console.log("✅ Verified: Landing page index.html is served properly with config.js and dynamic form structure");

  const configJsRes = await fetch(`${LANDING_URL}/config.js`);
  assert.strictEqual(configJsRes.status, 200, "config.js should return 200 OK");
  console.log("✅ Verified: config.js is served properly");

  const scriptJsRes = await fetch(`${LANDING_URL}/script.js`);
  assert.strictEqual(scriptJsRes.status, 200, "script.js should return 200 OK");
  console.log("✅ Verified: script.js is served properly");

  console.log("\n====================================================");
  console.log("🎉 ALL 10 INTEGRATION TESTS PASSED PERFECTLY!");
  console.log("====================================================");
}

runTests().catch((err) => {
  console.error("❌ Integration test failed:", err);
  process.exit(1);
});
