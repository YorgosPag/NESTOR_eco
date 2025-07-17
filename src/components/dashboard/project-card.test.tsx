/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './project-card';
import type { Project, Contact } from '@/types';

// Mock the next/link component as it doesn't work in a Jest environment without a router.
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode, href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock the useIsClient hook to ensure client-side logic runs during the test
jest.mock('@/hooks/use-is-client', () => ({
    useIsClient: () => true,
}));

describe('ProjectCard Component', () => {
    const mockProject: Project = {
        id: 'proj-1',
        title: "Test Project Title",
        applicationNumber: 'TP-001',
        ownerContactId: 'contact-1',
        deadline: new Date().toISOString(),
        interventions: [],
        budget: 5000,
        progress: 50,
        status: 'On Track',
        alerts: 0,
        auditLog: [],
    };

    const mockContacts: Contact[] = [
        { id: 'contact-1', firstName: 'John', lastName: 'Doe', role: 'Πελάτης' },
        { id: 'contact-2', firstName: 'Jane', lastName: 'Smith', role: 'Τεχνίτης' },
    ];

    it('renders the project title and owner name correctly', () => {
        render(<ProjectCard project={mockProject} contacts={mockContacts} />);

        // Check if the project title is displayed
        const titleElement = screen.getByText(/Test Project Title/i);
        expect(titleElement).toBeInTheDocument();

        // Check if the owner's name is displayed
        const ownerElement = screen.getByText(/John Doe/i);
        expect(ownerElement).toBeInTheDocument();
    });
});
