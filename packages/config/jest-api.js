module.exports = {
	clearMocks: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	modulePaths: ['<rootDir>/src'],
	setupFilesAfterEnv: ['<rootDir>/.jest/setup.ts'],
};
