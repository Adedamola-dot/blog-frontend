import { forwardRef } from 'react';

const Input = forwardRef(
    ({ label, error, className = '', ...rest }, ref) => (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input ref={ref} className="input-field" {...rest} />
            {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
        </div>
    )
);

Input.displayName = 'Input';

export default Input;