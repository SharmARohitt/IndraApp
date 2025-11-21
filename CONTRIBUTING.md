# Contributing to INDRA Mobile

Thank you for your interest in contributing to INDRA Mobile! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/indra-mobile.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Create a Pull Request

## Development Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

Quick start:
```bash
npm install
npm start
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Native

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Extract reusable logic into custom hooks

### Styling

- Use NativeWind (Tailwind) for styling when possible
- Keep StyleSheet definitions at the bottom of files
- Use theme colors from tailwind.config.js
- Ensure responsive design for different screen sizes

### File Organization

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── hooks/          # Custom React hooks
├── services/       # Business logic
├── api/            # API clients
├── libs/           # Utilities
├── store/          # State management
└── navigation/     # Navigation config
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Services**: PascalCase (e.g., `NotificationService.ts`)
- **Utilities**: camelCase (e.g., `imageUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE

### Git Commit Messages

Follow conventional commits:

```
feat: add offline map caching
fix: resolve sync queue bug
docs: update setup instructions
style: format code with prettier
refactor: simplify auth logic
test: add unit tests for useAuth
chore: update dependencies
```

## Testing

### Unit Tests

```bash
npm test
```

Write tests for:
- Custom hooks
- Utility functions
- API clients
- Business logic

### E2E Tests

```bash
npm run test:e2e
```

Test critical user flows:
- Authentication
- Task management
- Offline functionality
- Report submission

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Login/logout flow
- [ ] Task list loading
- [ ] Map display with markers
- [ ] Task detail view
- [ ] Photo capture
- [ ] Report submission (online)
- [ ] Report submission (offline)
- [ ] Sync queue processing
- [ ] Push notifications
- [ ] Navigation to substation
- [ ] Offline mode indicator
- [ ] Error handling

## Pull Request Process

1. **Update Documentation**: If you change functionality, update relevant docs
2. **Add Tests**: Include tests for new features
3. **Follow Style Guide**: Ensure code follows project conventions
4. **Update CHANGELOG**: Add entry describing your changes
5. **Screenshots**: Include screenshots for UI changes
6. **Description**: Provide clear PR description with:
   - What changed
   - Why it changed
   - How to test it

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console errors
```

## Feature Requests

Submit feature requests via GitHub Issues:

1. Check if feature already requested
2. Provide clear use case
3. Explain expected behavior
4. Include mockups if applicable

## Bug Reports

Submit bugs via GitHub Issues:

1. Check if bug already reported
2. Provide clear title and description
3. Include steps to reproduce
4. Add screenshots/videos
5. Specify device and OS version
6. Include relevant logs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
Add screenshots

**Device Info**
- Device: [e.g. iPhone 12]
- OS: [e.g. iOS 15.0]
- App Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

## Code Review Process

All PRs require review before merging:

1. Automated checks must pass
2. At least one approval required
3. Address all review comments
4. Maintain clean commit history
5. Rebase on main if needed

## Performance Guidelines

- Optimize images before committing
- Use React.memo for expensive components
- Implement proper list virtualization
- Avoid unnecessary re-renders
- Profile animations for 60fps

## Security Guidelines

- Never commit secrets or API keys
- Use environment variables for config
- Validate all user inputs
- Sanitize data before storage
- Follow OWASP mobile security guidelines

## Accessibility

- Add accessibility labels
- Ensure proper contrast ratios
- Support screen readers
- Test with accessibility tools
- Follow WCAG 2.1 guidelines

## Documentation

Update documentation for:

- New features
- API changes
- Configuration changes
- Breaking changes
- Migration guides

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Build and test
5. Create GitHub release
6. Deploy to stores

## Questions?

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

Thank you for contributing to INDRA Mobile! 🎉
