# Django and React Authentication Tutorial

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Backend Setup (Django)](#backend-setup-django)
  - [Create and activate a virtual environment](#create-and-activate-a-virtual-environment)
  - [Install Django, Django REST framework, and Django CORS Headers](#install-django-django-rest-framework-and-django-cors-headers)
  - [Create a new Django project](#create-a-new-django-project)
  - [Create a new Django app](#create-a-new-django-app)
  - [Install Django REST framework Simple JWT](#install-django-rest-framework-simple-jwt)
  - [Configure the Django project](#configure-the-django-project)
  - [Create the authentication URLs](#create-the-authentication-urls)
  - [Create the authentication views](#create-the-authentication-views)
  - [Create the authentication serializers](#create-the-authentication-serializers)
  - [Migrate the Database](#migrate-the-database)
  - [Create a superuser](#create-a-superuser)
  - [Run the development server](#run-the-development-server)
  - [Test the endpoints](#test-the-endpoints)
  - [Congratulations!](#congratulations)
- [Frontend Setup (React)](#frontend-setup-react)
  - [Create a new React app using Vite](#create-a-new-react-app-using-vite)
  - [Install Axios for making HTTP requests and React DOM Router](#install-axios-for-making-http-requests-and-react-dom-router)
  - [Install All Dependencies](#install-all-dependencies)
  - [Create a `services` directory](#create-a-services-directory)
  - [Create a new file frontend/src/services/api.js and add the following code:](#create-a-new-file-frontendsrcservicesapijs-and-add-the-following-code)
  - [Create a "components" directory](#create-a-components-directory)
  - [Create a new file frontend/src/components/Authentication.jsx and add the following code:](#create-a-new-file-frontendsrccomponentsauthenticationjsx-and-add-the-following-code)
  - [Create a new file frontend/src/AuthContext.jsx and add the following code:](#create-a-new-file-frontendsrcauthcontextjsx-and-add-the-following-code)
  - [Update the frontend/src/App.jsx file with the following code:](#update-the-frontendsrcappjsx-file-with-the-following-code)
  - [Run the React frontend:](#run-the-react-frontend)
  - [Congratulations!](#congratulations-1)
- [Resources](#resources)

## Introduction
This tutorial will guide you through setting up authentication using JWT (JSON Web Tokens) in a Django backend and a React frontend.

Before we start the actual coding, we need to understand how a Django backend and a React frontend can work together.

This setup will need a different approach compared to the traditional Django templating system.
Here the Django application will be act as an API (Application Programming Interface) server that provides endpoints for user registration, login, and authentication.

An API is a set of rules and protocols that allow different software applications to communicate with each other. With the introduction of REST (Representational State Transfer) APIs, it has become easier to create APIs that can be consumed by different clients, such as web applications, mobile applications, and IoT devices.

APIs come with some terms that you should be familiar with:

- **Endpoint:** A specific URL that the API exposes for clients to interact with. For example, `/api/register` and `/api/login` could be endpoints for user registration and login.

- **Request:** A message sent by a client to the API to perform a specific action. Requests can be of different types, such as GET, POST, PUT, DELETE, etc.

- **Response:** A message sent by the API to the client in response to a request. Responses typically include data or status codes.

Introducing APIs allows us to decouple the frontend and backend, making it easier to maintain and scale the application. In this tutorial, we will create a Django backend that provides authentication endpoints for user registration, login, and protected resources.

On the React frontend, we will create a user interface for user registration and login. The frontend will interact with the Django backend to authenticate users and access protected resources.

By the end of this tutorial, you will have a Django backend with JWT authentication and a React frontend that interacts with the backend to authenticate users and access protected endpoints.

Here's a brief overview to understand how a JWT authentication system works, let's break it down into three main steps:

1. **User Registration:** The user sends a POST request with their username and password to the registration endpoint.

2. **User Login:** The user sends a POST request with their username and password to the login endpoint. If the credentials are valid, the server responds with a JWT token.

3. **Authenticated Requests:** The user includes the JWT token in the `Authorization` header for any requests that require authentication.

## Prerequisites

- Python 3.x
- Node.js and npm
- Virtualenv (optional but recommended)

## Backend Setup (Django)

1.  **Create and activate a virtual environment:**

    ```sh
    python -m venv venv # You may use `python3` instead of `python` depending on your system
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2.  **Install Django, Django REST framework, and Django CORS Headers:**

    ```sh
     pip install django djangorestframework django-cors-headers
    ```

3.  **Create a new Django project:**

    ```sh
    django-admin startproject backend
    cd backend
    ```

4.  **Create a new Django app:**

    ```sh
     python manage.py startapp authentication
    ```

5.  **Install Django REST framework Simple JWT:**

    ```sh
    pip install djangorestframework_simplejwt
    ```

6.  **Configure the Django project:**

    - Add `rest_framework` and `authentication` to `INSTALLED_APPS` in [backend/backend/settings.py](backend/backend/settings.py).

    - We need also to enable "CORS" to allow the frontend to communicate with the backend. Add the following to the `MIDDLEWARE` section in [backend/backend/settings.py](backend/backend/settings.py).

    ```python
    INSTALLED_APPS = [
        ...
        'rest_framework', # <-- Add this
        'authentication', # <-- Add this
        'corsheaders', # <-- Add this to enable CORS
    ]

    MIDDLEWARE = [
        ...
        'corsheaders.middleware.CorsMiddleware', # <-- Add this to enable CORS
    ]
    ```

    - Add the following configurations towrads the end of the file [backend/backend/settings.py](backend/backend/settings.py).

    ```python
    # Auth
    ALLOWED_HOSTS = []

    # This is the URL where the frontend will be running
    # We only allow requests from this URL
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
    ]

    # This setting is required to allow the frontend to send cookies
    # with the requests
    REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            'rest_framework_simplejwt.authentication.JWTAuthentication',
        ),
    }

    # JWT settings
    SIMPLE_JWT = {
        'AUTH_HEADER_TYPES': ('Bearer',),
    }
    ```

    - In the above code, we have configured the `CORS_ALLOWED_ORIGINS` to allow requests from `http://localhost:5173` (the React frontend created using Vite). We have also configured the `DEFAULT_AUTHENTICATION_CLASSES` to use the `JWTAuthentication` class for authentication.

    - Include the authentication URLs in [backend/backend/urls.py](backend/backend/urls.py).

    ```python
    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('api/', include('authentication.urls')),
    ]
    ```

    Here we are including the authentication URLs under the `/api/` path.

7.  **Create the authentication URLs:**

    - Create a new file [backend/authentication/urls.py](backend/authentication/urls.py) and add the following code:

    ```python
    from django.urls import path
    from rest_framework_simplejwt.views import (
        TokenObtainPairView,
        TokenRefreshView,
    )

    from .views import RegisterView

    urlpatterns = [
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('register/', RegisterView.as_view(), name='register'),
    ]
    ```

    - In the above code, we have defined three endpoints:
      - `/api/token/`: Endpoint to obtain the JWT token.
      - `/api/token/refresh/`: Endpoint to refresh the JWT token. Thiis is useful when the access token expires.
      - `/api/register/`: Endpoint for user registration.

8.  **Create the authentication views:**

    - Insert the following code in [backend/authentication/views.py](backend/authentication/views.py):

    ```python
    from django.contrib.auth.models import User
    from rest_framework import generics
    from rest_framework.permissions import AllowAny
    from rest_framework.response import Response
    from rest_framework_simplejwt.tokens import RefreshToken
    from rest_framework import status

    from .serializers import RegisterSerializer

    class RegisterView(generics.CreateAPIView):
        queryset = User.objects.all()
        permission_classes = (AllowAny,)
        serializer_class = RegisterSerializer

        def post(self, request, *args, **kwargs):
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
    ```

    - In the above code, we have defined a `RegisterView` class that handles user registration. The view extends the `CreateAPIView` class and includes the `RegisterSerializer` for serializing user data. The view creates a new user and generates a JWT token for the user.

    A serializer is a class that converts complex data types, such as querysets and model instances, into native Python data types that can then be easily rendered into JSON, XML, or other content types. Serializers also provide deserialization, allowing parsed data to be converted back into complex types after validation.

9.  **Create the authentication serializers:**

    - Create a new file [backend/authentication/serializers.py](backend/authentication/serializers.py) and add the following code:

    ```python
    from django.contrib.auth.models import User
    from rest_framework import serializers

    class RegisterSerializer(serializers.ModelSerializer):
        password = serializers.CharField(write_only=True)

        class Meta:
            model = User
            fields = ('username', 'password', 'email')

        def create(self, validated_data):
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            return user
    ```

    - In the above code, we have defined a `RegisterSerializer` class that extends the `ModelSerializer` class. The serializer includes the `username`, `password`, and `email` fields from the `User` model. The `create` method creates a new user with the provided data.

10. **Migrate the Database:**

    ```sh
    python manage.py makemigrations
    python manage.py migrate
    ```

11. **Create a superuser:**

    ```
    python manage.py createsuperuser
    ```

    - You will be prompted to enter a username, email, and password for the superuser. This superuser can be used to access the Django admin interface.

12. **Run the development server:**

    ```
    python manage.py runserver
    ```

13. **Test the endpoints:**

    - Open a web browser or a tool like Postman and test the following endpoints:

      - `http://127.0.0.1:8000/api/register/`: Register a new user by sending a POST request with the `username`, `password`, and `email` fields.

      - `http://127.0.0.1:8000/api/token/`: Obtain a JWT token by sending a POST request with the `username` and `password` fields. Note that if you open the URL in your browser, you will get a `405 Method Not Allowed` error since browsers send GET requests by default. Use the `curl` command or a tool like Postman to send a POST request.

      - `http://127.0.0.1:8000/api/token/refresh/`: Refresh the JWT token by sending a POST request with the `refresh` field containing the refresh token.

    - You can also test the endpoints using the React frontend that we will create in the next section.

14. **Congratulations!** You have successfully set up a Django backend with JWT authentication.

## Frontend Setup (React)

Before we start setting up the React frontend, make sure you have Node.js and npm installed on your system.

If you are not familiar with React, you can follow the official React documentation to get started: [React - Getting Started](https://reactjs.org/docs/getting-started.html).

Here are a few terms you should be familiar with when working with React:

- **Components:** React components are the building blocks of a React application. They are reusable pieces of code that define how a part of the user interface should look and behave.

- **State:** State is a built-in feature in React that allows components to store and manage their own data. When the state of a component changes, React automatically re-renders the component to reflect the updated state.

- **Props:** Props (short for properties) are a way to pass data from a parent component to a child component in React. Props are read-only and cannot be modified by the child component.

- **Hooks:** Hooks are functions that allow functional components to use state and other React features. The most common hooks are `useState` for managing state and `useEffect` for performing side effects in functional components.

- **Context:** Context provides a way to share data between components without having to pass props through every level of the component tree. It is useful for sharing global data, such as authentication state, across different parts of the application.

- **Routing:** React Router is a popular library for handling routing in React applications. It allows you to define routes and navigate between different components based on the URL.

- **JSX:** JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components. JSX is compiled to regular JavaScript by tools like Babel.

Now let's set up the React frontend to interact with the Django backend.

1.  **Create a new React app using Vite:**

    - First, go back to the root directory of the project.

    - Create a new React app using Vite by running the following command:

    ```sh
    npm init vite@latest frontend --template react
    ```

    Alternatively, you can run:

    ```sh
    npm create vite@latest
    ```

    Then follow the prompts to create a new React app with the desired template.

    - Change to the `frontend` directory:

    ```sh
    cd frontend
    ```

2.  **Install Axios for making HTTP requests and React DOM Router:**

    ```sh
    npm install axios react-router-dom
    ```

    React Router is a popular library for handling routing in React applications. It allows you to define routes and navigate between different components based on the URL.

3.  **Install All Dependencies:**

    ```sh
    npm install
    ```

4.  **Create a `services` directory:**

    - Create a new directory named `services` inside the `src` directory:

    ```sh
    mkdir src/services
    ```

5.  **Create a new file [frontend/src/services/api.js](frontend/src/services/api.js) and add the following code:**

    ```js
    import axios from "axios";

    // TODO: change to env variable to prepare for deployment to production
    const API_URL = "http://localhost:8000/api";

    const api = axios.create({
      baseURL: API_URL,
    });

    export const login = async (username, password) => {
      const response = await api.post("/token/", { username, password });
      return response.data;
    };

    export const register = async (username, email, password) => {
      const response = await api.post("/register/", {
        username,
        email,
        password,
      });
      return response.data;
    };

    export const refreshToken = async (refreshToken) => {
      const response = await api.post("/token/refresh/", {
        refresh: refreshToken,
      });
      return response.data;
    };

    export default api;
    ```

    - In the above code, we have defined functions to interact with the authentication endpoints in the Django backend. The `login` function sends a POST request to the `/token/` endpoint with the `username` and `password` fields. The `register` function sends a POST request to the `/register/` endpoint with the `username`, `email`, and `password` fields. The `refreshToken` function sends a POST request to the `/token/refresh/` endpoint with the `refresh` field containing the refresh token.

6. **Create a "components" directory:**

   - Create a new directory named `components` inside the `src` directory:

   ```sh
   mkdir src/components
   ```

7. **Create a new file [frontend/src/components/Authentication.jsx](frontend/src/components/Authentication.jsx) and add the following code:**

   - This file will contain three components: `AuthForm`, `Register`, and `Login`.

   - The `AuthForm` component is a reusable form component that takes `onSubmit` and `fields` as props. The `fields` prop is an array of objects representing the form fields.

   - The `Register` component is a form for user registration. It includes fields for `username`, `email`, and `password`.

   - The `Login` component is a form for user login. It includes fields for `username` and `password`.

   ```js
   import { useState } from "react";
   import { useAuth } from "../AuthContext";
   import { useNavigate } from "react-router-dom";
   import { login as apiLogin, register as apiRegister } from "../services/api";

   const AuthForm = ({ onSubmit, fields, submitButtonText }) => {
     const [formData, setFormData] = useState(
       fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
     );
     const [error, setError] = useState("");

     const handleChange = (e) => {
       setFormData({
         ...formData,
         [e.target.name]: e.target.value,
       });
     };

     const handleSubmit = async (e) => {
       e.preventDefault();
       setError("");
       try {
         await onSubmit(formData);
       } catch (error) {
         console.error("AuthForm submission error:", error);
         setError(
           "An error occurred (see details in the console). Please try again."
         );
       }
     };

     return (
       <form onSubmit={handleSubmit}>
         {error && <p className="error">{error}</p>}
         {fields.map((field) => (
           <input
             key={field.name}
             type={field.type}
             name={field.name}
             placeholder={field.placeholder}
             value={formData[field.name]}
             onChange={handleChange}
             required={field.required}
           />
         ))}
         <button type="submit">{submitButtonText}</button>
       </form>
     );
   };

   export const Login = () => {
     const { login } = useAuth();
     const navigate = useNavigate();

     const handleSubmit = async (formData) => {
       const data = await apiLogin(formData.username, formData.password);
       login(data.access, data.refresh, formData.username);
       navigate("/private");
     };

     const fields = [
       {
         name: "username",
         type: "text",
         placeholder: "Username",
         required: true,
       },
       {
         name: "password",
         type: "password",
         placeholder: "Password",
         required: true,
       },
     ];

     return (
       <AuthForm
         onSubmit={handleSubmit}
         fields={fields}
         submitButtonText="Login"
       />
     );
   };

   export const Register = () => {
     const { login } = useAuth();
     const navigate = useNavigate();

     const handleSubmit = async (formData) => {
       await apiRegister(formData.username, formData.email, formData.password);
       const loginData = await apiLogin(formData.username, formData.password);
       login(loginData.access, loginData.refresh, formData.username);
       navigate("/private");
     };

     const fields = [
       {
         name: "username",
         type: "text",
         placeholder: "Username",
         required: true,
       },
       { name: "email", type: "email", placeholder: "Email", required: true },
       {
         name: "password",
         type: "password",
         placeholder: "Password",
         required: true,
       },
     ];

     return (
       <AuthForm
         onSubmit={handleSubmit}
         fields={fields}
         submitButtonText="Register"
       />
     );
   };
   ```

   Note: For this file, we are using the extension `.jsx` to indicate that it contains JSX code.

8. **Create a new file [frontend/src/AuthContext.jsx](frontend/src/AuthContext.jsx) and add the following code:**

    The `AuthContext` provides a way to share authentication state across the application. It includes the `AuthProvider` component that wraps the application and the `useAuth` hook that can be used to access the authentication state.

    ```js
    import { createContext, useState, useEffect, useContext } from "react";

    const LOCAL_STORAGE_NAMESPACE = "appAuthentication";

    const authStorage = {
      set: (key, value) => {
        const item = JSON.stringify(value);
        localStorage.setItem(`${LOCAL_STORAGE_NAMESPACE}.${key}`, item);
      },
      get: (key) => {
        const item = localStorage.getItem(`${LOCAL_STORAGE_NAMESPACE}.${key}`);
        return item ? JSON.parse(item) : null;
      },
      remove: (key) => {
        localStorage.removeItem(`${LOCAL_STORAGE_NAMESPACE}.${key}`);
      },
      clear: () => {
        Object.keys(localStorage)
          .filter((key) => key.startsWith(`${LOCAL_STORAGE_NAMESPACE}.`))
          .forEach((key) => localStorage.removeItem(key));
      },
    };

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [username, setUsername] = useState(null);

      useEffect(() => {
        checkLoginStatus();
      }, []);

      const checkLoginStatus = () => {
        const token = authStorage.get("access_token");
        const storedUsername = authStorage.get("username");
        if (token && storedUsername) {
          setIsLoggedIn(true);
          setUsername(storedUsername);
        } else {
          setIsLoggedIn(false);
          setUsername(null);
        }
      };

      const login = (accessToken, refreshToken, user) => {
        authStorage.set("access_token", accessToken);
        authStorage.set("refresh_token", refreshToken);
        authStorage.set("username", user);
        setIsLoggedIn(true);
        setUsername(user);
      };

      const logout = () => {
        authStorage.clear();
        setIsLoggedIn(false);
        setUsername(null);
      };

      const getAccessToken = () => authStorage.get("access_token");
      const getRefreshToken = () => authStorage.get("refresh_token");

      return (
        <AuthContext.Provider
          value={{
            isLoggedIn,
            username,
            login,
            logout,
            checkLoginStatus,
            getAccessToken,
            getRefreshToken,
          }}
        >
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);
    ```

9. **Update the [frontend/src/App.jsx](frontend/src/App.jsx) file with the following code:**

    This file will contain the main application logic, including routing and authentication context.

    ```js
    import { useEffect } from "react";
    import {
      BrowserRouter as Router,
      Route,
      Routes,
      NavLink,
      useNavigate,
    } from "react-router-dom";
    import { AuthProvider, useAuth } from "./AuthContext";
    import { Register, Login } from "./components/Authentication";

    import "./App.css";

    const Home = () => {
      const { isLoggedIn, username } = useAuth();
      return (
        <h2>
          {isLoggedIn
            ? `Welcome, ${username}! You're logged in.`
            : "Hi, please log in (or register) to use the site"}
        </h2>
      );
    };

    const PrivateComponent = () => {
      const { isLoggedIn, username } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
        if (!isLoggedIn) {
          navigate("/login");
        }
      }, [isLoggedIn, navigate]);

      return isLoggedIn ? (
        <h2>
          Welcome {username}! This is the private section for authenticated users
        </h2>
      ) : null;
    };

    const Navigation = () => {
      const { isLoggedIn, logout } = useAuth();
      const navigate = useNavigate();

      const handleLogout = () => {
        logout();
        console.log("Logout successful");
        navigate("/");
      };

      return (
        <nav>
          <h1>
            <NavLink to="/">Django+React Auth Example</NavLink>
          </h1>
          <ul>
            {isLoggedIn ? (
              <>
                <li>
                  <NavLink to="/private">PrivateComponent</NavLink>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      );
    };

    const AppContent = () => {
      const { isLoggedIn } = useAuth();

      return (
        <div className="App">
          <Navigation />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {isLoggedIn && <Route path="/private" element={<PrivateComponent />} />}
            <Route path="*" element={<h2>404 Not Found</h2>} />
          </Routes>
        </div>
      );
    };

    const App = () => {
      return (
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      );
    };

    export default App;
    ```

    Notice here that we have created a `PrivateComponent` that will only be accessible to authenticated users. If a user tries to access the `/private` route without being authenticated, they will be redirected to the login page.

    Also notice that `AuthProvder` wraps the entire application, providing authentication context to all components.

10. **You may want to add your CSS styles in the [frontend/src/App.css](frontend/src/App.css) and [frontend/src/index.css](frontend/src/index.css)**

11. **Run the React frontend:**

    - Start the React development server by running the following command:

    ```sh
    npm run dev
    ```

    - Open your web browser and navigate to `http://localhost:5173` to see the React frontend.

    - You can now register a new user, log in, and access the private section of the application.

    - You can also try to login using the Django admin superuser credentials to see the private section.

    - If you log out, you will be redirected to the home page.

11. **Congratulations!** You have successfully set up a React frontend that interacts with the Django backend for user authentication.

## Resources

### Concepts

- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS): Cross-Origin Resource Sharing (CORS) is a security feature that allows servers to specify who can access their resources.

- [REST APIs](https://restfulapi.net/): Representational State Transfer (REST) APIs are a set of rules and conventions for building APIs that allow different software applications to communicate with each other.

- [JWT](https://jwt.io/): JSON Web Tokens (JWT) are an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.

### Tools

- [Vite](https://vitejs.dev/): Vite is a build tool that provides a fast development server and optimized production builds for modern web applications.

- [Postman](https://www.postman.com/): Postman is a collaboration platform for API development that allows you to design, mock, test, and document APIs.

### Django

- [Django](https://www.djangoproject.com/): Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.

- [Django REST framework](https://www.django-rest-framework.org/): Django REST framework is a powerful and flexible toolkit for building Web APIs in Django.

- [Django Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/): Django Simple JWT provides a JSON Web Token authentication backend for the Django REST framework.

### React

- [React](https://reactjs.org/): React is a JavaScript library for building user interfaces.

- [React Router](https://reactrouter.com/): React Router is a popular library for handling routing in React applications.

- [Axios](https://axios-http.com/): Axios is a promise-based HTTP client for the browser and Node.js.

- [React Context](https://reactjs.org/docs/context.html): React Context provides a way to share data across the component tree without having to pass props down manually at every level.

- [React Hooks](https://reactjs.org/docs/hooks-intro.html): React Hooks are functions that allow functional components to use state and other React features.

- [React JSX](https://reactjs.org/docs/introducing-jsx.html): React JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components.
