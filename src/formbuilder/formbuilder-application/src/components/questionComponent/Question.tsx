import React, { ReactElement } from 'react';
import { Input, Row, Col, Button } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import './QuestionComponents.css';
import AnswerComponent from '../answerComponent/AnswerComponent';
const { TextArea } = Input;

const Question: React.FC = (): ReactElement => {
    return (
        <div>
            <Row>
                <Col span={23}>
                    <Row>
                        <Col span={23}>
                            <div style={{ display: 'inline' }}>
                                <div
                                    style={{
                                        width: '60%',
                                        display: 'inline-block',
                                        padding: '5px',
                                    }}
                                >
                                    <TextArea
                                        rows={2}
                                        placeholder="Spørsmål...."
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={23}>
                            <div style={{ display: 'inline' }}>
                                <div
                                    style={{
                                        width: '60%',
                                        display: 'inline-block',
                                        padding: '5px',
                                    }}
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder="Forklarende tekst....."
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <AnswerComponent></AnswerComponent>
                </Col>

                <Col span={1}>
                    <div style={{ display: 'inline' }}>
                        <Button
                            type="link"
                            shape="circle"
                            style={{ color: 'var(--primary-1)' }}
                            icon={<MoreOutlined />}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Question;
