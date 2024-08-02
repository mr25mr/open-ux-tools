import * as i18n from '../../../../src/i18n';
import { getPrompts } from '../../../../src/prompts/add-component-usages';
import * as validators from '@sap-ux/project-input-validator';

jest.mock('@sap-ux/project-input-validator');

jest.mock('@sap-ux/project-input-validator', () => ({
    ...jest.requireActual('@sap-ux/project-input-validator'),
    hasContentDuplication: jest.fn().mockReturnValue(false),
    hasCustomerPrefix: jest.fn().mockReturnValue(true),
    validateJSON: jest.fn().mockReturnValue(true),
    validateSpecialChars: jest.fn().mockReturnValue(true),
    validateEmptyString: jest.fn().mockReturnValue(true)
}));

describe('getPrompts', () => {
    const isLazyDropDownOptions = [
        { name: i18n.t('choices.true'), value: 'true' },
        { name: i18n.t('choices.false'), value: 'false' }
    ];
    const mockBasePath = '/path/to/project';
    const expectedPrompts = [
        {
            type: 'input',
            name: `id`,
            message: i18n.t('prompts.component.usageIdLabel'),
            validate: expect.any(Function),
            default: 'customer.',
            store: false,
            guiOptions: {
                mandatory: true,
                hint: i18n.t('prompts.component.usageIdTooltip')
            }
        },
        {
            type: 'input',
            name: 'name',
            message: i18n.t('prompts.component.nameLabel'),
            validate: expect.any(Function),
            store: false,
            guiOptions: {
                mandatory: true,
                hint: i18n.t('prompts.component.nameTooltip')
            }
        },
        {
            type: 'list',
            name: 'isLazy',
            message: i18n.t('prompts.component.isLazyLabel'),
            choices: isLazyDropDownOptions,
            default: isLazyDropDownOptions[1].value,
            store: false,
            guiOptions: {
                mandatory: true,
                hint: i18n.t('prompts.component.isLazyTooltip')
            }
        },
        {
            type: 'editor',
            name: `settings`,
            message: i18n.t('prompts.component.settingsLabel'),
            validate: expect.any(Function),
            store: false,
            guiOptions: {
                hint: i18n.t('prompts.component.tooltip', { input: i18n.t('prompts.component.settingsLabel') })
            }
        },
        {
            type: 'editor',
            name: `data`,
            message: i18n.t('prompts.component.dataLabel'),
            validate: expect.any(Function),
            store: false,
            guiOptions: {
                hint: i18n.t('prompts.component.tooltip', { input: i18n.t('prompts.component.dataLabel') })
            }
        },
        {
            type: 'confirm',
            name: 'shouldAddLibrary',
            message: i18n.t('prompts.component.shouldAddLibraryLabel'),
            default: false,
            guiOptions: {
                hint: i18n.t('prompts.component.shouldAddLibraryTooltip')
            }
        },
        {
            type: 'input',
            name: 'library',
            message: i18n.t('prompts.component.libraryLabel'),
            guiOptions: {
                mandatory: true,
                hint: i18n.t('prompts.component.libraryTooltip')
            },
            validate: expect.any(Function),
            store: false,
            when: expect.any(Function)
        },
        {
            type: 'list',
            name: `libraryIsLazy`,
            message: i18n.t('prompts.component.libraryIsLazyLabel'),
            choices: isLazyDropDownOptions,
            default: isLazyDropDownOptions[1].value,
            store: false,
            guiOptions: {
                mandatory: true,
                hint: i18n.t('prompts.component.libraryIsLazyTooltip')
            },
            when: expect.any(Function)
        }
    ];

    beforeAll(async () => {
        await i18n.initI18n();
    });

    test('should return prompts', () => {
        const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

        expect(prompts).toEqual(expectedPrompts);
    });

    test('should return prompts for non-customer base', () => {
        expectedPrompts[0].default = '';

        const prompts = getPrompts(mockBasePath, 'VENDOR');

        expect(prompts).toEqual(expectedPrompts);
    });

    describe('Validators', () => {
        test('should fail validation of id for special characters', () => {
            jest.spyOn(validators, 'validateSpecialChars').mockReturnValueOnce('error');

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'id')?.validate;
            if (validator) {
                expect(validator('customer.@id')).toBe('error');
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of id for missing customer prefix', () => {
            jest.spyOn(validators, 'hasCustomerPrefix').mockReturnValueOnce(false);

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'id')?.validate;

            if (validator) {
                expect(validator('@id')).toBe("Component Usage ID should start with 'customer.'");
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of id for content duplication', () => {
            jest.spyOn(validators, 'hasContentDuplication').mockReturnValueOnce(true);

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'id')?.validate;
            if (validator) {
                expect(validator('customer.id')).toBe(
                    'Component usage with the same name was already added to the project'
                );
            } else {
                fail('Validator not found');
            }
        });

        test('should pass validation of id', () => {
            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'id')?.validate;
            if (validator) {
                expect(validator('customer.id')).toBe(true);
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of name for special characters', () => {
            jest.spyOn(validators, 'validateSpecialChars').mockReturnValueOnce('error');

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'name')?.validate;

            if (validator) {
                expect(validator('name')).toBe('error');
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of comonent settings for JSON', () => {
            jest.spyOn(validators, 'validateJSON').mockReturnValueOnce('error');

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'settings')?.validate;

            if (validator) {
                expect(validator('settings')).toBe('error');
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of comonent data for JSON', () => {
            jest.spyOn(validators, 'validateJSON').mockReturnValueOnce('error');

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'data')?.validate;

            if (validator) {
                expect(validator('settings')).toBe('error');
            } else {
                fail('Validator not found');
            }
        });

        test('should pass validation of comonent data for empty input', () => {
            jest.spyOn(validators, 'validateEmptyString').mockReturnValueOnce('error');

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'data')?.validate;

            if (validator) {
                expect(validator('"key":"value"')).toBe(true);
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of library for special charecters', () => {
            jest.spyOn(validators, 'validateSpecialChars').mockReturnValueOnce('error');

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'library')?.validate;

            if (validator) {
                expect(validator('customer.@library')).toBe('error');
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of library for missing customer prefix', () => {
            jest.spyOn(validators, 'hasCustomerPrefix').mockReturnValueOnce(false);

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'library')?.validate;

            if (validator) {
                expect(validator('library')).toBe("Library Reference should start with 'customer.'");
            } else {
                fail('Validator not found');
            }
        });

        test('should pass validation of library', () => {
            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'library')?.validate;

            if (validator) {
                expect(validator('customer.library')).toBe(true);
            } else {
                fail('Validator not found');
            }
        });

        test('should fail validation of library for content duplication', () => {
            jest.spyOn(validators, 'hasContentDuplication').mockReturnValueOnce(true);

            const prompts = getPrompts(mockBasePath, 'CUSTOMER_BASE');

            const validator = prompts.find((prompt) => prompt.name === 'library')?.validate;

            if (validator) {
                expect(validator('library')).toBe('Library with the same name was already added to the project');
            } else {
                fail('Validator not found');
            }
        });
    });

    describe('When conditions', () => {
        test('should show library prompts when shouldAddLibrary is true', () => {
            const when = (getPrompts(mockBasePath, 'CUSTOMER_BASE')[6] as any).when;

            expect(when({ shouldAddLibrary: true })).toBeTruthy();
            expect(when({ shouldAddLibrary: false })).toBeFalsy();
        });

        test('should show libraryIsLazy when library is selected', () => {
            const when = (getPrompts(mockBasePath, 'CUSTOMER_BASE')[7] as any).when;

            expect(when({ shouldAddLibrary: true })).toBeTruthy();
            expect(when({ shouldAddLibrary: false })).toBeFalsy();
        });
    });
});
