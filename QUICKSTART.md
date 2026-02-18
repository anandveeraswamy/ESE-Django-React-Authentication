# Quick Start

### Create .env File
Create a `.env` file in the `backend` folder with the following content:
```
SECRET_KEY=your-secret-key-here
```
Replace `your-secret-key-here` with a secure secret key for Django.

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Make the port 8000 public.

Test the following endpoints. Please note that your Codespaces URLs will differ from the examples shown below, as these correspond to a specific instance.
- https://literate-xylophone-g95w9q7gj7hvrvr-8000.app.github.dev/api/register/
- https://literate-xylophone-g95w9q7gj7hvrvr-8000.app.github.dev/api/token/
- https://literate-xylophone-g95w9q7gj7hvrvr-8000.app.github.dev/api/token/refresh/

## Frontend Setup
```bash
cd frontend
nvm install 22.22.0
npm install
npm run dev
```

## Configure API URL
In `frontend/src/services/api.js` (line 5), update the API_URL:
```javascript
const API_URL = 'https://literate-xylophone-g95w9q7gj7hvrvr-8000.app.github.dev/'
```
Replace with your codespace URL.

---

For detailed instructions, see [README.md](README.md).
