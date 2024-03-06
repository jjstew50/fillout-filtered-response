

const apiUrl = 'https://api.fillout.com'

getAllResponses = async (formId, afterDate, beforeDate, status, includeEditLink, sort) => {
    const apiUrl = 'https://api.fillout.com'; // Update with your API URL
    const url = `${apiUrl}/v1/api/forms/${formId}/submissions`;

    // Construct query parameters string based on provided parameters
    const queryParams = new URLSearchParams();
    if (afterDate) queryParams.append('afterDate', afterDate);
    if (beforeDate) queryParams.append('beforeDate', beforeDate);
    if (status) queryParams.append('status', status);
    if (includeEditLink) queryParams.append('includeEditLink', includeEditLink);
    if (sort) queryParams.append('sort', sort);

    const query = queryParams.toString();
    const fullUrl = query ? `${url}?${query}` : url;

    var responseData;

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        responseData = await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

    return responseData;
}

// Controller functions for user management
const ResponsesController = {
    async getResponses(req, res) {
        const { limit = 150, afterDate, beforeDate, offset = 0, status, includeEditLink, sort, id, condition, value } = req.query;
        const filters = [];

        // Construct filters array based on provided query parameters
        if (id && condition && value) {
            if (id.length > 1 && Array.isArray(id)){
                for (let index = 0; index < id.length; index++) {
                    filters.push({ id: id[index], condition: condition[index], value: value[index] }); 
                }
            }
            else{
                filters.push({ id: id, condition: condition, value: value });
            }

        }
        const formId = req.params.formId;
        const data = await getAllResponses(formId, afterDate, beforeDate, status, includeEditLink, sort);

        // Filter data based on provided query parameters
        filteredData = filterData(filters, data["responses"]);

        // Calculate the new limit and offset based on filtered data
        const newLimit = Math.min(limit, filteredData.length);
        const newOffset = Math.min(offset, Math.max(filteredData.length - 1, 0));

        const paginatedData = filteredData.slice(newOffset, newOffset + newLimit);

        const returnData = {
            "responses": paginatedData,
            "totalResponses": filteredData.length,
            "pageCount": Math.ceil(filteredData.length / limit),
        };

        if (!data) {
          return res.status(404).json({ message: 'Responses not found' });
        }
        return res.json(returnData);
      },
}

filterData = (filters, data) => {
    return data.filter(response => {
        return filters.every(filter => {
            const { id, condition, value } = filter;
            const question = response.questions.find(q => q.id === id);
            if (!question) {
                return false; 
            }
    
            switch (condition) {
                case 'equals':
                    return question.value === value;
                case 'does_not_equal':
                    return question.value !== value;
                case 'greater_than':
                    return typeof question.value === 'number' && question.value > value;
                case 'less_than':
                    return typeof question.value === 'number' && question.value < value;
                default:
                    return true;
            }
        });
    });
}

module.exports = ResponsesController;