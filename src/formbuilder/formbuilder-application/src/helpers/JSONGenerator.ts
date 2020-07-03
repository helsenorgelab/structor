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
        // TODO: Add section desctiption
        for (let j = 0; j < sections[sectionKey].questionOrder.length; j++) {
            const questionKey = sections[sectionKey].questionOrder[j];
            const question = questions[questionKey];
            // Will be within 'item' and if in section another 'item' of type group
            const subItem = convertQuestion(
                question,
                i + 1 + '.' + (j + 1) + '00',
                valueSetMap,
            );
            if (
                (question.answer as IChoice).choices &&
                (question.answer as IChoice).choices.length > 0
            ) {
                subItem.options = {
                    reference: '#' + question.answer.id,
                };
            }
            if (question.description !== undefined) {
                item._text = {
                    extension: [
                        {
                            url:
                                'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                            valueMarkdown:
                                '### ' +
                                question.questionText +
                                '\r\n' +
                                question.description,
                        },
                    ],
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
        if (
            (answer as IChoice).choices &&
            (answer as IChoice).choices.length > 0
        ) {
            const system = 'system' + answer.id; // TODO
            valueSetMap[answer.id] = system;
            const containPart: fhir.Resource = {
                resourceType: 'ValueSet',
                id: answer.id,
                name: 'NAME' + questionIndex, // TODO: CHECK THIS
                title: 'TITLE' + questionIndex, // TODO: CHECK THIS
                status: 'draft',
                publisher: 'NHN',
                compose: {
                    include: [
                        {
                            system: system, // TODO: FIX ME
                            concept: new Array<
                                fhir.ValueSetComposeIncludeConcept
                            >(),
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
    sectionOrder: Array<string>,
    sections: SectionList,
    questions: QuestionList,
): fhir.Questionnaire {
    const valueSets = convertAnswers(sectionOrder, sections, questions);
    const convertedQuestions = convertSections(
        sectionOrder,
        sections,
        questions,
    );
    const questionnaire: fhir.Questionnaire = {
        resourceType: 'Questionnaire',
        language: 'nb-NO',
        name: 'hdir-NAVN', // TODO: FIX ME
        title: 'TITLE', // TODO: FIX ME
        status: 'draft',
        publisher: 'NHN',
        description: 'Description', // TODO: FIX ME
        meta: {
            profile: [
                'http://ehelse.no/fhir/StructureDefinition/sdf-Questionnaire',
            ],
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
            // TODO: FIX USECONTEXT
            {
                code: {
                    system: 'uri', // TODO: FIX ME
                    code: 'focus',
                    display: 'Clinical focus',
                },
                valueCodeableConcept: {
                    coding: [
                        {
                            system: 'uri',
                            code: '29',
                            display: 'TITLE', // TODO: FIX ME
                        },
                    ],
                },
            },
        ],
        contact: [
            {
                name: 'https://fhi.no/', // TODO: FIX ME
            },
        ],
        subjectType: ['Patient'],
        item: convertedQuestions,
    };
    return questionnaire;
}

export default convertToJSON;
