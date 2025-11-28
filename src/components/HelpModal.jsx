export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-backdrop-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-modal-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Help & Support</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span><strong>Email:</strong> support@deliverydispatch.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span><strong>Phone:</strong> +1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Help Topics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Help Topics</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">How to Create an Order</h4>
                <p className="text-sm text-gray-600">
                  Click the "Create Order" button on the dashboard, fill in customer details, delivery address, and submit.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">How to Assign a Rider</h4>
                <p className="text-sm text-gray-600">
                  Open an order card, click "Assign Rider", and select an available rider from the dropdown menu.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">How to Track Orders</h4>
                <p className="text-sm text-gray-600">
                  Use the Map tab to see real-time locations of riders and orders, or check the Orders History page for detailed records.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">How to Update Order Status</h4>
                <p className="text-sm text-gray-600">
                  Click on an order card, select the new status from the dropdown, and confirm the update.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-1">How to Add a New Rider</h4>
                <p className="text-sm text-gray-600">
                  Click the "Add Rider" button, enter rider details including name, email, phone, and submit the form.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">What do the order statuses mean?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>Unassigned:</strong> Order created but no rider assigned</li>
                  <li><strong>Assigned:</strong> Rider has been assigned to the order</li>
                  <li><strong>Picked Up:</strong> Rider has picked up the order</li>
                  <li><strong>Out for Delivery:</strong> Rider is on the way to customer</li>
                  <li><strong>Delivered:</strong> Order successfully delivered</li>
                  <li><strong>Failed:</strong> Delivery could not be completed</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">How do I filter orders?</h4>
                <p className="text-sm text-gray-600">
                  Go to the Orders tab or Orders History page and use the filter options to view orders by status, date, or search criteria.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">Can I track rider locations in real-time?</h4>
                <p className="text-sm text-gray-600">
                  Yes! The Map tab shows real-time locations of all active riders with their battery levels and last seen times.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need More Help?</h3>
            <p className="text-sm text-gray-700 mb-3">
              If you can't find the answer you're looking for, please don't hesitate to reach out to our support team. We're here to help!
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = 'mailto:support@deliverydispatch.com'}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Email Support
              </button>
              <button
                onClick={() => window.open('tel:+15551234567', '_self')}
                className="flex-1 px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Call Support
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Delivery Dispatch v1.0</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
