class ApiFeatures {
    constructor(query , queryString){
        this.query = query;

        this.queryString = queryString
    }

    // FILTERING
    filter() {
        // STEP 1 : COPY QUERY STRING
        const queryObj = {...this.queryString};

        // STEP 2: REMOVE NON-FILTER FIELDS
        const excludedFields = ["page" , "sort" , "limit" , " fields"];
        excludedFields.forEach(field => delete queryObj[field]);

        // STEP 3: HANDLE COMPARISON OPERATORS
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            match => `$${match}`
        )

        // STEP 4 : APPLY FILTER TO QUERY
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }


    // SORTING
    sort() {
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");

            this.query = this.query.sort(sortBy); 
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this;
    }

    // LIMITING FIELDS
    limitFields() {
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(",").join(" ");

            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }

        return this;
    }

    // PAGINATION
    async paginate() {
        // STEP 1 - GET PAGE AND LIMIT FROM QUERY
        const page = parseInt(this.queryString.page) || 1;

        const limit = parseInt(this.queryString.limit) || 10;

        // STEP 2 - CALCULATE SKIP
        const skip = (page - 1) * limit;

        // STEP 3: APPLY TO QUERY
        this.query = this.query.skip(skip).limit(limit);

        // STEP 4: GET TOTAL COUNT FOR META DATA
        const total = await this.query.model.countDocuments();

        // STEP 5 - CALCULATE TOTAL PAGES
        const totalPages = Math.ceil(total / limit);

        // STEP 6 : STORE PAGINATION DATA
        this.paginationResult = {
            total,  // total records
            totalPages, // total pages
            currentPage : page,
            limit,
            hasNextPage : page < totalPages,  // it there a next page?
            hasPrevPage : page > 1 // is there a prev page? 
        }

        return this; // enable chaining
    }
}

module.exports = ApiFeatures;