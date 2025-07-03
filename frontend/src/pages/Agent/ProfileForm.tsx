import React from 'react';

interface FormSectionProps {
    title: string;
    id: string;
    children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, id, children }) => {
    return (
        <div id={id} className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </div>
    );
};

export default FormSection;