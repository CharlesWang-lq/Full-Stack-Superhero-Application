# Full-Stack Web Application Project: Hero Hub

## Overview

Hero Hub is a comprehensive web application developed using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It serves as a platform for managing and exploring information about superheroes and hero lists. The application is designed with a user-friendly interface, robust security measures, and various features catering to both general and authenticated users.

## Features

### User Authentication and Account Management

#### Local Authentication Mechanism
- Users can create an account with a valid email, password, and nickname.
- Passwords are securely hashed using BCrypt to ensure data security.
- Input validation for email format is implemented to enhance data integrity.

#### Email Verification
- Utilizes the [email-verification](https://www.npmjs.com/package/email-verification) package for email verification.
- In case of a disabled account, users are prompted to contact the site administrator for assistance.

#### Limited Functionality for Unauthenticated Users
- Initial page displays application name, a brief description, and a login mechanism.
- Search functionality for heroes based on name, race, power, or publisher, with soft-matching for search terms.
- Displays up to 10 public hero lists, ordered by last modified date, showing name, creator’s nickname, number of heroes, and average rating.

### Hero Management

#### General User Functionality
- Search results provide a quick overview of hero names and publishers.
- Expanded view for detailed information on each hero.
- "Search on DDG" button for each result to perform a DuckDuckGo search on the selected hero.
- Public hero lists showcase hero names, powers, and publishers, with the ability to expand for additional details.

#### Authenticated User Enhancements
- Authenticated users can create and manage up to 20 named hero lists.
- Each list includes a unique name, description, a collection of heroes, and a visibility flag (public or private).
- Edit functionality for existing lists, allowing modification of all aspects and recording the last edited time.
- Ability to delete a hero list.

### User Reviews and Ratings

#### Public Lists
- Authenticated users can add reviews with ratings and optional comments to any public hero list.
- Reviews contribute to an average rating for each public hero list.

### Administrator Functionalities

#### Site Maintenance
- Special user with administrator access.
- Privilege management, enabling the granting of site manager privileges to selected users.
- Ability to mark reviews as hidden or clear the "hidden" flag.
- Option to mark a user as "disabled" or clear the "disabled" flag.

#### Copyright Enforcement
- Implementation of a security and privacy policy, an acceptable use policy, and a DMCA notice & takedown policy.
- Tools for administrators to log requests, notices, and disputes related to copyright enforcement.
- Mechanism to hide reviews with alleged copyright or AUP violations, with the option to restore contested reviews.

### Web Service API

#### API Revision
- Revision of the API developed for the project, ensuring alignment with new functionalities.
- Integration of the API to provide required functionality across the application.

### Usability, Code Quality, and Non-functional Requirements

- Input sanitization to safeguard against injection attacks.
- Use of JWT for authorization tasks.
- Cross-browser and cross-form factor compatibility for a seamless user experience.
- Modular, extensible, and maintainable code, minimizing code duplication.
- Proper use of comments for code readability.
- Strong hash algorithms, such as BCrypt, for user password security.

### Logistics and Submission Instructions

- Follow strict naming conventions for repositories and use proper `.gitignore` files.
- Provide comprehensive Git logs and zip files for submission.
- Submission includes a completed test plan, ensuring accurate testing and validation of functionalities.

## Technologies Used

### Front-end Frameworks
- React.

### Backend Technologies
- Node.js, Express.js.

### Database
- MongoDB.

### Authentication and Database Services
- PassportJS or Auth0 for authentication.

## References and Resources

### Authentication and Security
- [PassportJS](http://www.passportjs.org/) or [Auth0](https://auth0.com/).
- [Email Verification](https://www.npmjs.com/package/email-verification).
- [Salted Password Hashing - Doing it Right](https://crackstation.net/hashing-security.htm).

### Responsive Design
- [Angular Material](https://material.angular.io/).

### Additional Resources
- [JWT Official Site](https://jwt.io/).
- [Angular Security Guide](https://angular.io/guide/security).

### Copyright Enforcement
- [DMCA Demystified](http://www.sfwa.org/2013/03/the-dmca-takedown-notice-demystified/).
- [GitHub DMCA Policy](https://help.github.com/articles/dmca-takedown-policy/).

### CORS Setup
- Set up a proxy to the front-end server or static route to front-end content.
- [Firebase](https://firebase.google.com/) for authentication and database services.

## Workflow Suggestions

1. Thoroughly read the requirements section multiple times.
2. Clone the repository with the new name and create the front-end project in the "client" folder.
3. Design a database structure suitable for MongoDB.
4. Revise the API developed in previous iterations for new functionalities.
5. Implement access control logic for secure and admin routes.
6. Gradually implement back-end and front-end functionalities, ensuring a modular and organized codebase.

**Hero Hub - Unleash the Power of Heroes!**
