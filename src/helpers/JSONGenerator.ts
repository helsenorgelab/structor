import SectionList from '../types/SectionList';
import QuestionList from '../types/QuestionList';
import { AnswerTypes, IChoice, FhirAnswerTypes } from '../types/IAnswer';
import IQuestion from '../types/IQuestion';
import convertQuestion from './QuestionHelpers';

export interface QuestionConverted {
    type: FhirAnswerTypes;
    extension?: Array<fhir.Extension>;
}

export type ValueSetMap = { [id: string]: string };

const valueSetMap: ValueSetMap = {};

function convertSections(
    sectionOrder: Array<string>,
    sections: SectionList,
    questions: QuestionList,
): Array<fhir.QuestionnaireItem> {
    const items = [];
    for (let i = 0; i < sectionOrder.length; i++) {
        const sectionKey = sectionOrder[i];
        const section = sections[sectionKey];
        const item: fhir.QuestionnaireItem = {
            linkId: String(i + 1),
            text: section.sectionTitle,
            type: 'group',
            repeats: false,
            item: new Array<fhir.QuestionnaireItem>(),
        };
        let currentLinkId = 100;

        if (section.description && section.description.length > 0) {
            item.item?.push({
                linkId: i + 1 + '.' + 101,
                text: section.description,
                _text: {
                    extension: [
                        {
                            url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                            valueMarkdown: section.description,
                        },
                    ],
                },
                type: 'display',
            });
            currentLinkId = 200;
        }

        for (let j = 0; j < sections[sectionKey].questionOrder.length; j++) {
            const questionKey = sections[sectionKey].questionOrder[j];
            const question = questions[questionKey];
            if (
                ((question.questionText && question.questionText.length === 0) ||
                    question.answerType === AnswerTypes.default) &&
                question.answerType !== AnswerTypes.info
            )
                continue;
            const subItem = convertQuestion(question, i + 1 + '.' + currentLinkId, valueSetMap);
            currentLinkId += 100;
            if ((question.answer as IChoice).choices && (question.answer as IChoice).choices.length > 0) {
                subItem.options = {
                    reference: '#' + question.answer.id,
                };
            }
            item.item?.push(subItem);
        }
        items.push(item);
    }
    return items;
}
function convertAnswers(
    sectionOrder: Array<string>,
    sections: SectionList,
    questions: QuestionList,
): Array<fhir.Resource> {
    const valueSets = new Array<fhir.Resource>();
    let questionIndex = 0;
    Object.values(questions).forEach((question: IQuestion) => {
        questionIndex++;
        const answer = question.answer;
        if ((answer as IChoice).choices && (answer as IChoice).choices.length > 0) {
            const system = 'system' + answer.id;
            valueSetMap[answer.id] = system;
            const containPart: fhir.Resource = {
                resourceType: 'ValueSet',
                id: answer.id,
                name: 'valueset' + questionIndex,
                title: 'valueset' + questionIndex,
                status: 'draft',
                publisher: 'NHN',
                compose: {
                    include: [
                        {
                            system: system,
                            concept: new Array<fhir.ValueSetComposeIncludeConcept>(),
                        },
                    ],
                },
            };

            for (const k in (answer as IChoice).choices) {
                containPart.compose?.include[0].concept?.push({
                    code: String(parseInt(k) + 1),
                    display: (answer as IChoice).choices[parseInt(k)],
                });
            }
            valueSets.push(containPart);
        }
    });
    return valueSets;
}

function convertToJSON(
    title: string,
    description: string,
    sectionOrder: Array<string>,
    sections: SectionList,
    questions: QuestionList,
): fhir.Questionnaire {
    const valueSets = convertAnswers(sectionOrder, sections, questions);
    const convertedQuestions = convertSections(sectionOrder, sections, questions);
    const questionnaire: fhir.Questionnaire = {
        resourceType: 'Questionnaire',
        language: 'nb-NO',
        name: 'hdir-' + title,
        title: title,
        status: 'draft',
        publisher: 'NHN',
        description: description,
        meta: {
            profile: ['http://ehelse.no/fhir/StructureDefinition/sdf-Questionnaire'],
            tag: [
                {
                    system: 'urn:ietf:bcp:47',
                    code: 'nb-NO',
                    display: 'Norsk bokmål',
                },
            ],
        },
        contained: valueSets,
        useContext: [
            {
                code: {
                    system: 'uri', // TODO
                    code: 'focus',
                    display: 'Clinical focus',
                },
                valueCodeableConcept: {
                    coding: [
                        {
                            system: 'uri', // TODO
                            code: '29',
                            display: title,
                        },
                    ],
                },
            },
        ],
        contact: [
            {
                name: 'https://fhi.no/',
            },
        ],
        subjectType: ['Patient'],
        item: convertedQuestions,
    };
    return questionnaire;
}

export default convertToJSON;