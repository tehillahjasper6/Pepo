# Contributing to PEPO 🐝

Thank you for your interest in contributing to PEPO! This document provides guidelines and instructions.

## Code of Conduct

- Be respectful and inclusive
- Collaborate constructively
- Focus on what's best for the community
- Show empathy and kindness

## How Can I Contribute?

### Reporting Bugs

**Before submitting:**
- Check existing issues
- Verify it's reproducible
- Collect relevant information

**Bug Report Template:**
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [e.g., macOS 13.0]
- Browser/App: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Screenshots:**
If applicable
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Feature Description:**
Clear description of the feature

**Use Case:**
Why is this needed?

**Proposed Solution:**
How should it work?

**Alternatives:**
Other approaches considered

**Additional Context:**
Screenshots, mockups, etc.
```

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Follow code style**
5. **Add tests**
6. **Commit with clear messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

## Development Guidelines

### Code Style

**TypeScript/JavaScript:**
- Use TypeScript for type safety
- Follow Airbnb style guide
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

**React/React Native:**
- Use functional components
- Use hooks appropriately
- Keep components focused
- Extract reusable logic

**Backend (NestJS):**
- Follow NestJS conventions
- Use DTOs for validation
- Implement proper error handling
- Add Swagger documentation

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

Examples:
```
feat(draw): add cryptographic randomness
fix(auth): resolve OTP expiration issue
docs(api): update API documentation
```

### Testing

**Backend:**
```bash
cd backend
npm test
npm run test:e2e
```

**Web:**
```bash
cd apps/web
npm test
```

**Mobile:**
```bash
cd apps/mobile
npm test
```

### Code Review Process

1. **Automated Checks**: All PRs must pass CI/CD
2. **Code Review**: At least one approval required
3. **Testing**: Manually test major changes
4. **Documentation**: Update docs if needed

## Project Structure

```
pepo-monorepo/
├── apps/
│   ├── web/           # Next.js web app
│   ├── mobile/        # React Native app
│   └── admin/         # Admin panel
├── backend/           # NestJS API
├── packages/
│   ├── types/         # Shared TypeScript types
│   ├── config/        # Design system config
│   └── ui/            # Shared UI components
└── infrastructure/    # Docker, deployment
```

## Areas to Contribute

### High Priority
- 🎨 UI/UX improvements
- 🐛 Bug fixes
- 📱 Mobile app enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization
- 📊 Analytics & reporting

### Features
- Video uploads for giveaways
- Location-based search
- Advanced filters
- Social sharing
- Wishlist/favorites
- User ratings/reviews (careful with dignity)

### Infrastructure
- Performance optimization
- Caching strategies
- Database optimization
- Documentation
- Testing coverage

## Design Philosophy

Remember PEPO's core values:
- **Human-centered**: Not transactional
- **Fair**: Random selection
- **Dignified**: No pressure, no ranking
- **Private**: Secure data handling
- **Warm**: Friendly, approachable UI

### UI/UX Guidelines

**Do:**
- Use rounded corners
- Apply soft shadows
- Integrate bee mascot tastefully
- Use warm colors (honey gold, pollen cream)
- Write friendly, conversational copy
- Ensure mobile-first design

**Don't:**
- Create gamification elements
- Add leaderboards or rankings
- Make interactions feel transactional
- Use harsh colors or sharp edges
- Create urgency or FOMO
- Expose gender publicly

## Getting Help

- 💬 Join discussions in Issues
- 📧 Email: dev@pepo.app
- 📚 Read the documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the app (for major contributions)

---

**Thank you for making PEPO better!** 🐝💛

*Give Freely. Live Lightly.*




