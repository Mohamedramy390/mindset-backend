# Mindset Backend

**Team Name:** MindsetAI

### 3. **Environment Setup**
Create a `.env` file in the root directory with the following content:
```
MONGO_URI=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
HU_API_KEY=your_huggingface_api_key
CLIENT_ORIGIN=http://localhost:5173
```
*(Replace values with your actual credentials)*

### 4. **Run the Application**
```bash
npm run dev
```
The backend will start on `http://localhost:4000`.

---

## 📦 Dependencies

- express
- mongoose
- cors
- dotenv
- bcrypt
- jsonwebtoken
- multer
- axios
- pdf-parse
- (and others as listed in `package.json`)

---

## ✨ Project Features

- User authentication (register/login) with JWT
- Teacher and student roles
- Room creation with PDF upload and AI-powered topic extraction
- Semantic search and question answering on PDF content using Generative AI
- Topic-based analytics (question count per topic)
- RESTful API endpoints for all core features
- CORS support for frontend integration
- Secure environment variable management

---

## 🧠 Generative AI Usage Log

1. Contextual Question Answering (/generate)
Accepts user queries with accompanying context text
Uses Gemini AI to provide accurate answers based solely on the provided context
Implements safety measures by limiting context to 8,000 characters
Returns "I don't know" when answers aren't found in the context
2. Topic Extraction (/topics)
Analyzes educational or technical text to identify main topics
Extracts section titles and key themes from documents
Returns a clean list of topic titles without numbering or formatting
Processes up to 6,000 characters of input text
3. Question Categorization (/categorize)
Determines which topic from a given list is most relevant to a user's question
Helps route questions to appropriate content sections
Returns the exact topic title that best matches the query
Technical Implementation
Framework: Flask web framework
AI Model: Google Generative AI (Gemini 2.5 Pro)
API Design: RESTful endpoints with JSON request/response
Security: Environment variable configuration for API keys
Scalability: Fresh model instances per request to avoid memory issues
Generative AI Usage Log
Instance 1: Initial Flask Application Structure
Task: Generated Flask boilerplate and API endpoint structure
AI Tool: GitHub Copilot
Purpose: Created the basic Flask app setup with route definitions
Outcome: Established foundation for /generate, /topics, and /categorize endpoints
Instance 2: Gemini AI Integration
Task: Implemented Google Generative AI SDK integration
AI Tool: GitHub Copilot
Purpose: Added proper API key configuration and model initialization
Outcome: Successfully integrated Gemini 2.5 Pro model with environment variable safety
Instance 3: Prompt Engineering for Question Answering
Task: Designed effective prompts for contextual Q&A
AI Tool: Manual prompt crafting with Gemini AI testing
Purpose: Created prompts that ensure answers stay within provided context
Outcome: Achieved reliable context-bound responses with fallback handling
Instance 4: Topic Extraction Algorithm
Task: Developed prompt for extracting main topics from text
AI Tool: GitHub Copilot for code structure, manual prompt optimization
Purpose: Enable automatic identification of document sections and themes
Outcome: Clean topic extraction without formatting artifacts
Instance 5: Question Categorization Logic
Task: Built system to match questions with relevant topics
AI Tool: GitHub Copilot for endpoint logic
Purpose: Route user queries to most appropriate content sections
Outcome: Accurate topic matching for improved user experience
Instance 6: Error Handling and Input Validation
Task: Added comprehensive error handling for all endpoints
AI Tool: GitHub Copilot
Purpose: Ensure robust API behavior with proper error responses
Outcome: Reliable 400 status codes for missing or invalid inputs
Instance 7: Performance Optimization
Task: Implemented text length limits and fresh model instances
AI Tool: GitHub Copilot suggestions
Purpose: Prevent API timeouts and memory issues
Outcome: Stable performance with 6K-8K character limits per request
Instance 8: Documentation and Code Comments
Task: Added comprehensive docstrings and inline comments
AI Tool: GitHub Copilot
Purpose: Improve code maintainability and developer onboarding
Outcome: Self-documenting code with clear function descriptions


---

## 📋 License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.

---


**Generative AI tools (Gemini pro) were used throughout development for code generation, debugging, and documentation. All AI-generated code was reviewed and tested by the team.**
