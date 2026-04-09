import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';

// A simple component to verify React & DOM events are working in the test environment
function SanityCheckComponent() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Sanity Check Test Area</h1>
            <p data-testid="count-display">Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}

describe('Frontend Test Environment Sanity Check', () => {
    it('renders heading text properly', () => {
        render(<SanityCheckComponent />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent('Sanity Check Test Area');
    });

    it('handles DOM events (click) correctly', () => {
        render(<SanityCheckComponent />);
        
        const countDisplay = screen.getByTestId('count-display');
        const button = screen.getByRole('button', { name: /increment/i });
        
        expect(countDisplay).toHaveTextContent('Count: 0');
        
        fireEvent.click(button);
        
        expect(countDisplay).toHaveTextContent('Count: 1');
    });
});
