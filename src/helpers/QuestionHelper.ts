import { Coding, Extension, QuestionnaireItem, ValueSetComposeIncludeConcept } from '../types/fhir';
import { IExtentionType, IOperator, IQuestionnaireItemType, IValueSetSystem } from '../types/IQuestionnareItemType';
import { CodingSystemType } from './systemHelper';
import { Option, Options } from '../types/OptionTypes';
import { ItemControlType } from './itemControl';

const itemType = [
    {
        display: 'Gruppe',
        code: IQuestionnaireItemType.group,
    },
    {
        display: 'Beskjed',
        code: IQuestionnaireItemType.display,
    },
    {
        display: 'Kortsvar',
        code: IQuestionnaireItemType.string,
    },
    {
        display: 'Langsvar',
        code: IQuestionnaireItemType.text,
    },
    {
        display: 'Alternativer',
        code: IQuestionnaireItemType.choice,
    },
    {
        display: 'Alternativer med åpent svar',
        code: IQuestionnaireItemType.openChoice,
    },
    {
        display: 'Forhåndsdefinerte alternativer',
        code: IQuestionnaireItemType.predefined,
    },
    {
        display: 'Mottakerliste',
        code: IQuestionnaireItemType.address,
    },
    {
        display: 'Dato',
        code: IQuestionnaireItemType.date,
    },
    {
        display: 'Klokkeslett',
        code: IQuestionnaireItemType.time,
    },
    {
        display: 'Dato og klokkeslett',
        code: IQuestionnaireItemType.dateTime,
    },
    {
        display: 'Bekreftelse',
        code: IQuestionnaireItemType.boolean,
    },
    {
        // Used for itemTypes integer and decimal
        display: 'Tall',
        code: IQuestionnaireItemType.number,
    },
    {
        display: 'Antall med enhet',
        code: IQuestionnaireItemType.quantity,
    },
    {
        display: 'Vedlegg',
        code: IQuestionnaireItemType.attachment,
    },
    {
        display: 'Utvidbar info',
        code: IQuestionnaireItemType.inline,
    },
];

export const ATTACHMENT_DEFAULT_MAX_SIZE = 5.0;

export const QUANTITY_UNIT_TYPE_NOT_SELECTED = 'QUANTITY_UNIT_TYPE_NOT_SELECTED';
export const QUANTITY_UNIT_TYPE_CUSTOM = 'QUANTITY_UNIT_TYPE_CUSTOM';
export const quantityUnitTypes = [
    {
        system: '',
        code: QUANTITY_UNIT_TYPE_NOT_SELECTED,
        display: 'Ingen enhet',
    },
    {
        system: 'http://unitsofmeasure.org',
        code: 'cm',
        display: 'centimeter',
    },
    {
        system: 'http://unitsofmeasure.org',
        code: 'kg',
        display: 'kilo',
    },
    {
        system: 'http://unitsofmeasure.org',
        code: 'a',
        display: 'år',
    },
    {
        system: 'http://unitsofmeasure.org',
        code: 'mo',
        display: 'måned',
    },
    {
        system: 'http://unitsofmeasure.org',
        code: 'd',
        display: 'dag',
    },
    {
        system: '',
        code: QUANTITY_UNIT_TYPE_CUSTOM,
        display: 'Egendefinert',
    },
];

export const checkboxExtension = {
    url: IExtentionType.itemControl,
    valueCodeableConcept: {
        coding: [
            {
                system: IValueSetSystem.itemControlValueSet,
                code: ItemControlType.checkbox,
            },
        ],
    },
};

export const dropdownExtension = {
    url: IExtentionType.itemControl,
    valueCodeableConcept: {
        coding: [
            {
                system: IValueSetSystem.itemControlValueSet,
                code: ItemControlType.dropdown,
            },
        ],
    },
};

export const enableWhenOperatorBoolean: ValueSetComposeIncludeConcept[] = [
    {
        code: IOperator.exists,
        display: 'Er besvart',
    },
    {
        code: IOperator.notExists,
        display: 'Ikke er besvart',
    },
    {
        code: IOperator.equal,
        display: 'Er lik',
    },
    {
        code: IOperator.notEqual,
        display: 'Ikke er lik',
    },
];

export const enableWhenOperatorChoice: ValueSetComposeIncludeConcept[] = [
    {
        code: IOperator.exists,
        display: 'Er besvart',
    },
    {
        code: IOperator.notExists,
        display: 'Ikke er besvart',
    },
    {
        code: IOperator.equal,
        display: 'Er lik',
    },
    {
        code: IOperator.notEqual,
        display: 'Ikke er lik',
    },
];

export const enableWhenOperatorDate: ValueSetComposeIncludeConcept[] = [
    {
        code: IOperator.exists,
        display: 'Er besvart',
    },
    {
        code: IOperator.notExists,
        display: 'Ikke er besvart',
    },
    {
        code: IOperator.equal,
        display: 'Er lik',
    },
    {
        code: IOperator.notEqual,
        display: 'Ikke er lik',
    },
    {
        code: IOperator.greaterThan,
        display: 'Er etter',
    },
    {
        code: IOperator.lessThan,
        display: 'Er før',
    },
    {
        code: IOperator.greaterThanOrEqual,
        display: 'Er etter eller lik',
    },
    {
        code: IOperator.lessThanOrEqual,
        display: 'Er før eller lik',
    },
];

export const enableWhenOperator: ValueSetComposeIncludeConcept[] = [
    {
        code: IOperator.exists,
        display: 'Er besvart',
    },
    {
        code: IOperator.notExists,
        display: 'Ikke er besvart',
    },
    {
        code: IOperator.equal,
        display: 'Er lik',
    },
    {
        code: IOperator.notEqual,
        display: 'Ikke er lik',
    },
    {
        code: IOperator.greaterThan,
        display: 'Er større enn',
    },
    {
        code: IOperator.lessThan,
        display: 'Er mindre enn',
    },
    {
        code: IOperator.greaterThanOrEqual,
        display: 'Er større enn eller lik',
    },
    {
        code: IOperator.lessThanOrEqual,
        display: 'Er mindre enn eller lik',
    },
];

export const typeIsSupportingValidation = (type: IQuestionnaireItemType): boolean => {
    const validTypes = [
        IQuestionnaireItemType.attachment,
        IQuestionnaireItemType.number,
        IQuestionnaireItemType.quantity,
        IQuestionnaireItemType.text,
        IQuestionnaireItemType.string,
        IQuestionnaireItemType.date,
        IQuestionnaireItemType.dateTime,
    ];

    return validTypes.includes(type);
};

const makeOption = (display: string, code: string): Option => {
    return { display, code };
};

export const EnrichmentSet: Options = {
    options: [
        {
            display: 'Pasient',
            options: [
                makeOption(
                    'Fødselsnummer',
                    "Patient.identifier.where(use = 'official' and (system = 'urn:oid:2.16.578.1.12.4.1.4.1' or system = 'urn:oid:2.16.578.1.12.4.1.4.2')).value",
                ),
                makeOption('Fullt navn', "Patient.name.where(use = 'official').select(given.join(' ') & ' ' & family)"),
                makeOption(
                    'Fornavn',
                    "Patient.name.where(use = 'official').select(iif(given.count() > 1, given.take(count()-1), given).join(' '))",
                ),
                makeOption('Etternavn', "Patient.name.where(use = 'official').family"),
                makeOption(
                    'Alder',
                    "Patient.extension.where(url = 'http://helsenorge.no/fhir/StructureDefinition/sdf-age').value",
                ),
                makeOption('Mobiltelefonnummer', "Patient.telecom.where(use = 'mobile' and system = 'phone').value"),
                makeOption('Epost', "Patient.telecom.where(use = 'home' and system = 'email').value"),
                makeOption('Adresse', "Patient.address.where(use = 'home').line.first()"),
                makeOption('Postnummer', "Patient.address.where(use = 'home').postalCode"),
                makeOption('Poststed', "Patient.address.where(use = 'home').city"),
                makeOption('Midlertidig c/o', "Patient.address.where(use = 'temp').line[0]"),
                makeOption('Midlertidig adresse', "Patient.address.where(use = 'temp').line[1]"),
                makeOption('Midlertidig postnummer', "Patient.address.where(use = 'temp').line[2]"),
                makeOption('Midlertidig poststed', "Patient.address.where(use = 'temp').line[3]"),
            ],
        },
        {
            display: 'På vegne av innbygger',
            options: [
                makeOption(
                    'Fylles skjema ut på vegne av noen andre? (true/false)',
                    "iif(%representative.relationship.coding.where(system = 'http://hl7.org/fhir/v3/RoleCode' and (code = 'PRN' or code = 'GRANTEE')).count() > 0, true, false)",
                ),
                makeOption(
                    'På vegne av innbygger (Fødselsnummer)',
                    "RelatedPerson.identifier.where(use = 'official' and (system = 'urn:oid:2.16.578.1.12.4.1.4.1' or system = 'urn:oid:2.16.578.1.12.4.1.4.2')).value",
                ),
                makeOption(
                    'På vegne av innbygger (Navn)',
                    "RelatedPerson.name.where(use = 'official').select(given.join(' ') & ' ' & family)",
                ),
                makeOption(
                    'På vegne av innbygger (Mobiltelefonnummer)',
                    "RelatedPerson.telecom.where(use = 'mobile' and system = 'phone').value",
                ),
                makeOption('På vegne av innbygger (Adresse)', "RelatedPerson.address.where(use = 'home').line.first()"),
                makeOption(
                    'På vegne av innbygger (Postnummer)',
                    "RelatedPerson.address.where(use = 'home').postalCode",
                ),
                makeOption('På vegne av innbygger (Poststed)', "RelatedPerson.address.where(use = 'home').city"),
                makeOption(
                    'På vegne av innbygger (Midlertidig c/o)',
                    "RelatedPerson.address.where(use = 'temp').line[0]",
                ),
                makeOption(
                    'På vegne av innbygger (Midlertidig adresse)',
                    "RelatedPerson.address.where(use = 'temp').line[1]",
                ),
                makeOption(
                    'På vegne av innbygger (Midlertidig postnummer)',
                    "RelatedPerson.address.where(use = 'temp').line[2]",
                ),
                makeOption(
                    'På vegne av innbygger (Midlertidig poststed)',
                    "RelatedPerson.address.where(use = 'temp').line[3]",
                ),
            ],
        },
    ],
};

export const getInitialText = (item?: QuestionnaireItem): string => {
    if (
        (item?.type === IQuestionnaireItemType.text || item?.type === IQuestionnaireItemType.string) &&
        item?.initial &&
        item.initial[0]
    ) {
        return item.initial[0].valueString || '';
    }
    return '';
};

export const getSublabel = (item?: QuestionnaireItem): string => {
    return item?.extension?.find((extension) => extension.url === IExtentionType.sublabel)?.valueMarkdown || '';
};

export const getRepeatsText = (item?: QuestionnaireItem): string => {
    return item?.extension?.find((extension) => extension.url === IExtentionType.repeatstext)?.valueString || '';
};

export const getValidationMessage = (item?: QuestionnaireItem): string => {
    return item?.extension?.find((extension) => extension.url === IExtentionType.validationtext)?.valueString || '';
};

export const getPlaceHolderText = (item?: QuestionnaireItem): string => {
    return item?.extension?.find((extension) => extension.url === IExtentionType.entryFormat)?.valueString || '';
};

export const getMarkdownText = (extensions?: Extension[]): string => {
    return extensions?.find((extension) => extension.url === IExtentionType.markdown)?.valueMarkdown || '';
};

export const getGuidanceAction = (item?: QuestionnaireItem): string => {
    return item?.extension?.find((extension) => extension.url === IExtentionType.guidanceAction)?.valueString || '';
};

export const getGuidanceParameterName = (item?: QuestionnaireItem): string => {
    return item?.extension?.find((extension) => extension.url === IExtentionType.guidanceParam)?.valueString || '';
};

export const isValidGuidanceParameterName = (name: string): boolean => {
    const regExp = /^[A-Za-z0-9_]{1,254}$/;
    return regExp.test(name);
};

export const valueSetTqqcCoding: Coding = {
    system: CodingSystemType.valueSetTqqc,
    code: '1',
    display: 'Technical endpoint for receiving QuestionnaireResponse',
};

export const isRecipientList = (item?: QuestionnaireItem): boolean => {
    return (item?.code && item.code[0].system === CodingSystemType.valueSetTqqc) || false;
};

export default itemType;
