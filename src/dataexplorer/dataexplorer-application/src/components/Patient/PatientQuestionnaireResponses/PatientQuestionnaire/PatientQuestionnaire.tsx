import React, { useState, useEffect, useContext } from 'react';
import PatientView from './PatientView/PatientView';
import { Row, Spin } from 'antd';
import dayjs from 'dayjs';
import { PatientContext } from 'components/Patient/PatientContext';

const PatientQuestionnaire = () => {
    const [dataSource, setDataSource] = useState<fhir.ResourceBase[]>([]);

    const { questionnaire, questionnaireResponse: questionnaireResponses } = useContext(PatientContext);

    useEffect(() => {
        const qdict = new Map();
        questionnaire.entry.forEach((j) => {
            qdict.set(j.resource?.id, j.resource?.title);
        });
        setDataSource([]);
        questionnaireResponses.entry.forEach((item) => {
            setDataSource((dataSource) => [
                ...dataSource,
                {
                    id: item.resource.id,
                    schemaName: qdict.get(
                        item.resource.questionnaire?.reference
                            ?.substr(item.resource.questionnaire?.reference?.indexOf('Questionnaire/'))
                            .split('/')[1],
                    ),
                    submitted: dayjs(item.resource.meta?.lastUpdated).format('DD.MM.YYYY - HH:mm').toString(),
                },
            ]);
        });
    }, [questionnaire, questionnaireResponses]);

    return (
        <>
            {questionnaire && dataSource && <PatientView dataSource={dataSource} hasQuestionnaireResponses={true} />}
            {!questionnaire && (
                <Row justify="center">
                    <Spin className="spin-container" size="large" />
                </Row>
            )}
        </>
    );
};

export default PatientQuestionnaire;
