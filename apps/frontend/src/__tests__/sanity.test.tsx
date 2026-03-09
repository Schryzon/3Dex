import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

describe('Sanity Check', () => {
    it('renders a heading', () => {
        render(<h1>Hello World</h1>)

        const heading = screen.getByRole('heading', { level: 1 })

        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('Hello World')
    })
})
