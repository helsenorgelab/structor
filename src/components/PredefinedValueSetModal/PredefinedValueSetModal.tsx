import React, { useContext, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import createUUID from '../../helpers/CreateUUID';
import { appendValueSetAction } from '../../store/valueSetStore/ValueSetAction';
import { ValueSetContext } from '../../store/valueSetStore/ValueSetStore';
import { ValueSet } from '../../types/fhir';
import Btn from '../Btn/Btn';
import FormField from '../FormField/FormField';
import Modal from '../Modal/Modal';
import './PredefinedValueSetModal.css';

type Props = {
    close: () => void;
};

const initValueSet = () =>
    ({
        resourceType: 'ValueSet',
        id: `pre-${createUUID()}`,
        version: '1.0',
        name: '',
        title: '',
        date: new Date().toISOString(),
        status: 'draft',
        publisher: '',
        compose: {
            include: [
                {
                    system: '',
                    concept: [
                        {
                            id: createUUID(),
                            code: '',
                            display: '',
                        },
                        {
                            id: createUUID(),
                            code: '',
                            display: '',
                        },
                    ],
                },
            ],
        },
    } as ValueSet);

const PredefinedValueSetModal = (props: Props): JSX.Element => {
    const { state, dispatch } = useContext(ValueSetContext);
    const [newValueSet, setNewValueSet] = useState<ValueSet>({ ...initValueSet() });
    const { predefinedValueSet } = state;

    const addNewElement = () => {
        const compose = { ...newValueSet.compose };
        compose.include[0].concept?.push({
            id: createUUID(),
            code: '',
            display: '',
        });
        setNewValueSet({ ...newValueSet, ...compose });
    };

    const removeElement = (id?: string) => {
        const compose = { ...newValueSet.compose };
        const conceptToDelete = compose.include[0].concept?.findIndex((x) => x && x.id === id);
        if (conceptToDelete || conceptToDelete === 0) {
            compose.include[0].concept?.splice(conceptToDelete, 1);
        }

        setNewValueSet({ ...newValueSet, ...compose });
    };

    const handleConceptItem = (value: string, updateField: 'code' | 'display', id?: string) => {
        const compose = { ...newValueSet.compose };
        const item = compose.include[0]?.concept?.find((x) => x && x.id === id);

        if (item) {
            item[updateField] = value;
        }

        setNewValueSet({ ...newValueSet, ...compose });
    };

    const dispatchValueSet = () => {
        dispatch(appendValueSetAction([newValueSet]));
        setNewValueSet({ ...initValueSet() });
    };

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? 'lightblue' : 'transparent',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
        userSelect: 'none',
        background: isDragging ? 'lightgreen' : 'transparent',
        cursor: 'pointer',
        ...draggableStyle,
    });

    const handleOrder = (result: DropResult) => {
        if (!result.source || !result.destination || !result.draggableId) {
            return;
        }

        const fromIndex = result.source.index;
        const toIndex = result.destination.index;

        const compose = { ...newValueSet.compose };
        const itemToMove = compose.include[0].concept?.splice(fromIndex, 1);

        if (fromIndex !== toIndex && itemToMove) {
            compose.include[0].concept?.splice(toIndex, 0, itemToMove[0]);
            setNewValueSet({ ...newValueSet, ...compose });
        }
    };

    const handleSystem = (value: string) => {
        const compose = { ...newValueSet.compose };
        compose.include[0].system = value;
        setNewValueSet({ ...newValueSet, ...compose });
    };

    return (
        <Modal close={props.close} title="Predefinerte verdier" size="large" bottomCloseText="Lukk">
            <div className="predefined-container">
                <div>
                    <FormField label="Tittel">
                        <input
                            value={newValueSet.title}
                            onChange={(event) => setNewValueSet({ ...newValueSet, title: event.target.value })}
                        />
                    </FormField>
                    <FormField label="Teknisk-navn">
                        <input
                            value={newValueSet.name}
                            onChange={(event) => setNewValueSet({ ...newValueSet, name: event.target.value })}
                        />
                    </FormField>
                    <FormField label="Distributør">
                        <input
                            value={newValueSet.publisher}
                            onChange={(event) => setNewValueSet({ ...newValueSet, publisher: event.target.value })}
                        />
                    </FormField>
                    <FormField label="System">
                        <input
                            value={newValueSet.compose?.include[0].system}
                            onChange={(event) => handleSystem(event.target.value)}
                        />
                    </FormField>
                    <div className="btn-group center-text">
                        <Btn onClick={addNewElement} title="+ Nytt valg" variant="secondary" size="small" />
                        <Btn onClick={dispatchValueSet} title="Opprett >" variant="primary" size="small" />
                    </div>
                    <div className="value-set">
                        <DragDropContext onDragEnd={handleOrder}>
                            <Droppable droppableId={`droppable-new-value-set`} type="value-set">
                                {(provided, snapshot) => (
                                    <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                                        {newValueSet.compose?.include[0].concept?.map((item, index) => {
                                            return (
                                                <Draggable key={item.id} draggableId={item.id || '1'} index={index}>
                                                    {(providedDrag, snapshotDrag) => (
                                                        <div
                                                            ref={providedDrag.innerRef}
                                                            {...providedDrag.draggableProps}
                                                            style={getItemStyle(
                                                                snapshotDrag.isDragging,
                                                                providedDrag.draggableProps.style,
                                                            )}
                                                            className="answer-option-item align-everything"
                                                        >
                                                            <span
                                                                className="reorder-icon"
                                                                aria-label="reorder element"
                                                                {...providedDrag.dragHandleProps}
                                                            />
                                                            <div className="answer-option-content align-everything">
                                                                <input
                                                                    value={item.display}
                                                                    placeholder="Legg inn tittel.."
                                                                    onChange={(event) =>
                                                                        handleConceptItem(
                                                                            event.target.value,
                                                                            'display',
                                                                            item.id,
                                                                        )
                                                                    }
                                                                />
                                                                <input
                                                                    value={item.code}
                                                                    placeholder="Legg inn verdi.."
                                                                    onChange={(event) =>
                                                                        handleConceptItem(
                                                                            event.target.value,
                                                                            'code',
                                                                            item.id,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                            {newValueSet.compose?.include[0].concept?.length &&
                                                                newValueSet.compose?.include[0].concept?.length > 2 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeElement(item.id)}
                                                                        name="Fjern element"
                                                                        className="align-everything"
                                                                    />
                                                                )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
                <div>
                    {predefinedValueSet.map((x) => (
                        <div key={x.id}>
                            <p>
                                <strong>{x.title}</strong> ({x.name})
                            </p>
                            <ul>
                                {x?.compose?.include[0]?.concept?.map((y) => (
                                    <li key={y.code}>
                                        {y.display} ({y.code})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default PredefinedValueSetModal;
