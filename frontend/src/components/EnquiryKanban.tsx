"use client";

import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import { Calendar, DollarSign, GripVertical, Building } from 'lucide-react';

const STAGES = [
    { id: "NEW", title: "New Lead", color: "border-sky-500/30 bg-sky-500/5 text-sky-400" },
    { id: "DISCOVERY_SENT", title: "Discovery Sent", color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
    { id: "DISCOVERY_SUBMITTED", title: "Discovery Form", color: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400" },
    { id: "REVIEW", title: "Under Review", color: "border-purple-500/30 bg-purple-500/5 text-purple-400" },
    { id: "PROPOSAL", title: "Proposal", color: "border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-400" },
    { id: "NEGOTIATION", title: "Negotiation", color: "border-orange-500/30 bg-orange-500/5 text-orange-400" },
    { id: "APPROVED", title: "Won", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" },
    { id: "DECLINED", title: "Lost", color: "border-red-500/30 bg-red-500/5 text-red-400" },
];

export function KanbanCard({ enquiry, onClick, className = '' }: any) {
    return (
        <div 
            onClick={onClick}
            className={`p-3 rounded-xl bg-[#141a23] border border-white/5 shadow-md flex flex-col gap-2 cursor-pointer hover:border-white/20 transition-all ${className}`}
        >
            <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-white text-sm line-clamp-1">{enquiry.clientName}</h4>
                <div className="cursor-grab active:cursor-grabbing p-1 text-neutral-500 hover:text-white rounded hover:bg-white/10 transition-colors">
                    <GripVertical className="w-3.5 h-3.5" />
                </div>
            </div>
            
            {enquiry.companyName && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Building className="w-3 h-3" />
                    <span className="line-clamp-1">{enquiry.companyName}</span>
                </div>
            )}

            <div className="flex flex-wrap gap-1 mt-1">
                {enquiry.servicesRequested?.slice(0, 2).map((srv: string, idx: number) => (
                    <span key={idx} className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/5 text-neutral-300 border border-white/10 whitespace-nowrap">
                        {srv}
                    </span>
                ))}
                {enquiry.servicesRequested?.length > 2 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/5 text-neutral-300 border border-white/10">
                        +{enquiry.servicesRequested.length - 2}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <DollarSign className="w-3 h-3" />
                    {enquiry.estimatedValue ? enquiry.estimatedValue.toLocaleString() : '0'}
                </div>
                {enquiry.probability ? (
                    <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 rounded">
                        {enquiry.probability}%
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function SortableKanbanCard({ enquiry, onClick }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: enquiry.id,
        data: {
            type: "Enquiry",
            enquiry
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div 
                ref={setNodeRef} 
                style={style} 
                className="opacity-30 p-3 rounded-xl bg-[#141a23] border border-blue-500/50 shadow-md h-[120px]"
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanCard enquiry={enquiry} onClick={() => onClick(enquiry)} />
        </div>
    );
}

export default function EnquiryKanban({ enquiries, onEnquiryClick, onUpdateStage }: any) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeEnquiry, setActiveEnquiry] = useState<any | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setActiveEnquiry(active.data.current?.enquiry);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveEnquiry(null);

        if (!over) return;

        const enquiryId = active.id;
        const targetStage = over.id; // column id

        const enquiry = enquiries.find((e: any) => e.id === enquiryId);
        if (!enquiry) return;
        
        // check if dropping on a column
        if (STAGES.find(s => s.id === targetStage)) {
            if (enquiry.stage !== targetStage) {
                onUpdateStage(enquiryId, targetStage);
            }
        }
    };

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full overflow-x-auto custom-scrollbar pb-4 p-2 items-start">
                {STAGES.map(stage => {
                    const columnEnquiries = enquiries.filter((e: any) => e.stage === stage.id);
                    
                    return (
                        <div 
                            key={stage.id} 
                            className="flex-shrink-0 w-80 flex flex-col h-full bg-[#0a0f16]/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
                        >
                            <div className={`p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r ${stage.color.replace('border', 'from').replace('30', '5')} to-transparent`}>
                                <h3 className={`font-semibold text-sm drop-shadow-sm ${stage.color.split(' ')[2]}`}>
                                    {stage.title}
                                </h3>
                                <div className="text-xs font-medium text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                    {columnEnquiries.length}
                                </div>
                            </div>
                            
                            <div 
                                className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 min-h-[150px]"
                                // Simplified: Just use the Droppable container for columns directly
                                // we can use sortable context if we make a proper custom Droppable
                            >
                                <SortableContext items={columnEnquiries.map((e: any) => e.id)}>
                                    <div id={stage.id} className="h-full flex flex-col gap-3 min-h-[100px]">
                                        <DroppableColumn id={stage.id} items={columnEnquiries}>
                                            {columnEnquiries.map((enq: any) => (
                                                <SortableKanbanCard key={enq.id} enquiry={enq} onClick={onEnquiryClick} />
                                            ))}
                                        </DroppableColumn>
                                    </div>
                                </SortableContext>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.4',
                        },
                    },
                }),
            }}>
                {activeId && activeEnquiry ? (
                    <KanbanCard enquiry={activeEnquiry} className="rotate-3 scale-105 shadow-2xl border-indigo-500/50" />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Simple Droppable Component for columns
import { useDroppable } from '@dnd-kit/core';

function DroppableColumn({ id, children, items }: any) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
        data: {
            type: "Column"
        }
    });

    return (
        <div ref={setNodeRef} className={`flex-1 flex flex-col gap-3 transition-colors ${isOver ? 'bg-white/[0.02] rounded-xl' : ''}`}>
            {children}
            {items.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-4 border border-dashed border-white/10 text-neutral-600 rounded-xl text-xs font-medium content-center h-24">
                    Drop here
                </div>
            )}
        </div>
    );
}
